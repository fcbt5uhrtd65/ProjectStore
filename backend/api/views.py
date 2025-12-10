"""
API Views for ProjectStore
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q, F
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    User, Category, Product, Order, OrderItem,
    Cart, CartItem, Review, StockMovement
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateUpdateSerializer, OrderListSerializer, OrderDetailSerializer,
    OrderCreateSerializer, CartSerializer, CartItemSerializer,
    ReviewSerializer, StockMovementSerializer
)
from .permissions import IsAdminUser, IsOwnerOrAdmin


# ============================================
# AUTHENTICATION VIEWS
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        from django.utils import timezone
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user"""
    return Response(UserSerializer(request.user).data)


# ============================================
# CATEGORY VIEWSET
# ============================================

class CategoryViewSet(viewsets.ModelViewSet):
    """Category CRUD operations"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()


# ============================================
# PRODUCT VIEWSET
# ============================================

class ProductViewSet(viewsets.ModelViewSet):
    """Product CRUD operations"""
    queryset = Product.objects.select_related('category').filter(active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'featured', 'recommended', 'active']
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['created_at', 'price', 'rating', 'sales_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def retrieve(self, request, *args, **kwargs):
        """Increment view count on product detail"""
        instance = self.get_object()
        instance.view_count = F('view_count') + 1
        instance.save(update_fields=['view_count'])
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products"""
        products = self.queryset.filter(featured=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Get recommended products"""
        products = self.queryset.filter(recommended=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search products by name, description, or tags"""
        query = request.query_params.get('q', '')
        if query:
            products = self.queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(tags__contains=[query])
            )
            serializer = ProductListSerializer(products, many=True)
            return Response(serializer.data)
        return Response([])


# ============================================
# ORDER VIEWSET
# ============================================

class OrderViewSet(viewsets.ModelViewSet):
    """Order CRUD operations"""
    queryset = Order.objects.select_related('user').prefetch_related('items')
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        return OrderDetailSerializer
    
    def get_queryset(self):
        """Users can only see their own orders, admins see all"""
        if self.request.user.role == 'admin':
            return self.queryset
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        """Update order status (admin only)"""
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        return Response(OrderDetailSerializer(order).data)


# ============================================
# CART VIEWSET
# ============================================

class CartViewSet(viewsets.ModelViewSet):
    """Shopping cart operations"""
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get user's active cart"""
        return Cart.objects.filter(user=self.request.user, is_active=True)
    
    def get_object(self):
        """Get or create user's active cart"""
        cart, created = Cart.objects.get_or_create(
            user=self.request.user,
            is_active=True
        )
        return cart
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add item to cart"""
        cart = self.get_object()
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        try:
            product = Product.objects.get(id=product_id, active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return Response(CartSerializer(cart).data)
    
    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """Update cart item quantity"""
        cart = self.get_object()
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity')
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            if quantity <= 0:
                cart_item.delete()
            else:
                cart_item.quantity = quantity
                cart_item.save()
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(CartSerializer(cart).data)
    
    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """Remove item from cart"""
        cart = self.get_object()
        item_id = request.data.get('item_id')
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response(CartSerializer(cart).data)
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from cart"""
        cart = self.get_object()
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)


# ============================================
# REVIEW VIEWSET
# ============================================

class ReviewViewSet(viewsets.ModelViewSet):
    """Product review operations"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'rating']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrAdmin()]
        elif self.action == 'create':
            return [IsAuthenticated()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        """Create review and update product rating"""
        review = serializer.save()
        product = review.product
        
        # Recalculate product rating
        reviews = product.reviews.all()
        product.rating = sum(r.rating for r in reviews) / reviews.count()
        product.review_count = reviews.count()
        product.save(update_fields=['rating', 'review_count'])


# ============================================
# STOCK MOVEMENT VIEWSET
# ============================================

class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """Stock movement tracking (read-only)"""
    queryset = StockMovement.objects.select_related('product')
    serializer_class = StockMovementSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'type']
    ordering = ['-created_at']
