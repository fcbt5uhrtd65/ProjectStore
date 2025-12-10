"""
Serializers for ProjectStore API
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, Category, Product, Order, OrderItem,
    Cart, CartItem, Review, StockMovement
)


# ============================================
# USER SERIALIZERS
# ============================================

class UserSerializer(serializers.ModelSerializer):
    """User serializer"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'role', 'phone',
            'address', 'city', 'department',
            'is_active', 'email_verified', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'email_verified']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'name', 'phone']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Login serializer"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(
            username=data['email'],
            password=data['password']
        )
        if not user:
            raise serializers.ValidationError("Credenciales inválidas")
        if not user.is_active:
            raise serializers.ValidationError("Usuario inactivo")
        data['user'] = user
        return data


# ============================================
# CATEGORY SERIALIZERS
# ============================================

class CategorySerializer(serializers.ModelSerializer):
    """Category serializer"""
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image_url',
            'parent', 'display_order', 'is_active', 'children'
        ]
    
    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.filter(is_active=True), many=True).data
        return []


# ============================================
# PRODUCT SERIALIZERS
# ============================================

class ProductListSerializer(serializers.ModelSerializer):
    """Product list serializer (minimal fields)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'image', 'price', 'discount',
            'final_price', 'stock', 'rating', 'review_count',
            'category_name', 'featured', 'recommended', 'active'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Product detail serializer (all fields)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = [
            'id', 'view_count', 'sales_count', 'rating',
            'review_count', 'created_at', 'updated_at'
        ]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Product create/update serializer"""
    
    class Meta:
        model = Product
        exclude = ['view_count', 'sales_count', 'rating', 'review_count']


# ============================================
# ORDER SERIALIZERS
# ============================================

class OrderItemSerializer(serializers.ModelSerializer):
    """Order item serializer"""
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image',
            'price', 'quantity', 'subtotal'
        ]
        read_only_fields = ['id']


class OrderListSerializer(serializers.ModelSerializer):
    """Order list serializer"""
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_phone',
            'total', 'status', 'delivery_method', 'created_at'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    """Order detail serializer"""
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Order creation serializer"""
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = [
            'customer_name', 'customer_phone', 'customer_email',
            'customer_address', 'delivery_method', 'subtotal',
            'discount', 'total', 'notes', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Generate order number
        import datetime
        now = datetime.datetime.now()
        order_number = f"ORD-{now.strftime('%Y%m%d%H%M%S')}"
        
        # Add user if authenticated
        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        
        order = Order.objects.create(
            order_number=order_number,
            user=user,
            **validated_data
        )
        
        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order


# ============================================
# CART SERIALIZERS
# ============================================

class CartItemSerializer(serializers.ModelSerializer):
    """Cart item serializer"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)
    product_price = serializers.DecimalField(
        source='product.final_price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_name', 'product_image',
            'product_price', 'quantity', 'subtotal'
        ]
        read_only_fields = ['id']
    
    def get_subtotal(self, obj):
        return obj.product.final_price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    """Cart serializer"""
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'created_at', 'expires_at']
        read_only_fields = ['id', 'created_at', 'expires_at']
    
    def get_total(self, obj):
        return sum(
            item.product.final_price * item.quantity
            for item in obj.items.all()
        )


# ============================================
# REVIEW SERIALIZERS
# ============================================

class ReviewSerializer(serializers.ModelSerializer):
    """Review serializer"""
    
    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'rating', 'comment',
            'user_name', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'is_verified', 'created_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        validated_data['user_name'] = user.name or user.email
        return super().create(validated_data)


# ============================================
# STOCK MOVEMENT SERIALIZERS
# ============================================

class StockMovementSerializer(serializers.ModelSerializer):
    """Stock movement serializer"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'type', 'quantity',
            'previous_stock', 'new_stock', 'reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
