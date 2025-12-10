"""
Django models for ProjectStore
Migrated from database/schema.sql
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


# ============================================
# USER MODEL & MANAGER
# ============================================

class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication"""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """User model - admins and clients"""
    
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('client', 'Cliente'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    
    # Personal information
    name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Address
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    email_verified = models.BooleanField(default=False)
    last_login = models.DateTimeField(blank=True, null=True)
    
    # Django admin
    is_staff = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


# ============================================
# CATEGORY MODEL
# ============================================

class Category(models.Model):
    """Product categories with hierarchy support"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    image_url = models.TextField(blank=True, null=True)
    
    # Hierarchy
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children'
    )
    
    # Display
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['parent']),
            models.Index(fields=['is_active']),
            models.Index(fields=['display_order']),
        ]
    
    def __str__(self):
        return self.name


# ============================================
# PRODUCT MODEL
# ============================================

class Product(models.Model):
    """Product catalog with full information"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    
    # Category
    category = models.ForeignKey(
        Category,
        on_delete=models.RESTRICT,
        related_name='products'
    )
    
    # Pricing and inventory
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    discount = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    stock = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    
    # SKU
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    
    # Images
    image = models.TextField(blank=True, null=True)
    images = ArrayField(
        models.TextField(),
        default=list,
        blank=True
    )
    
    # Product characteristics
    brand = models.CharField(max_length=100, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    size = models.CharField(max_length=50, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True)
    weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        blank=True,
        null=True
    )
    dimensions = models.CharField(max_length=100, blank=True, null=True)
    
    # Additional info
    warranty = models.CharField(max_length=255, blank=True, null=True)
    shipping = models.CharField(max_length=255, blank=True, null=True)
    returns = models.CharField(max_length=255, blank=True, null=True)
    
    # Features and tags
    features = ArrayField(
        models.TextField(),
        default=list,
        blank=True
    )
    tags = ArrayField(
        models.TextField(),
        default=list,
        blank=True
    )
    
    # Status
    active = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    recommended = models.BooleanField(default=False)
    
    # Special pricing
    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )
    offer_start_date = models.DateTimeField(blank=True, null=True)
    offer_end_date = models.DateTimeField(blank=True, null=True)
    
    # Metrics
    view_count = models.IntegerField(default=0)
    sales_count = models.IntegerField(default=0)
    
    # Ratings
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    review_count = models.IntegerField(default=0)
    
    # Stock alert
    min_stock = models.IntegerField(
        default=5,
        validators=[MinValueValidator(0)]
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_products'
    )
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['sku']),
            models.Index(fields=['active']),
            models.Index(fields=['featured']),
            models.Index(fields=['recommended']),
            models.Index(fields=['price']),
            models.Index(fields=['stock']),
            models.Index(fields=['-sales_count']),
            models.Index(fields=['-view_count']),
            models.Index(fields=['-rating']),
        ]
    
    def __str__(self):
        return self.name
    
    @property
    def final_price(self):
        """Calculate final price after discount"""
        if self.discount > 0:
            return self.price * (1 - self.discount / 100)
        return self.price
    
    @property
    def is_low_stock(self):
        """Check if stock is below minimum"""
        return self.stock <= self.min_stock


# ============================================
# ORDER MODEL
# ============================================

class Order(models.Model):
    """Customer orders"""
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmado'),
        ('in_transit', 'En Tránsito'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True)
    
    # User (nullable for guest checkout)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    
    # Customer information
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=20)
    customer_email = models.EmailField(blank=True, null=True)
    customer_address = models.TextField()
    
    # Delivery method
    delivery_method = models.CharField(max_length=50, default='Domicilio')
    
    # Totals
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Notes
    notes = models.TextField(blank=True, null=True)
    admin_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['customer_phone']),
            models.Index(fields=['customer_email']),
            models.Index(fields=['customer_name']),
        ]
    
    def __str__(self):
        return f"Order {self.order_number}"


# ============================================
# ORDER ITEM MODEL
# ============================================

class OrderItem(models.Model):
    """Individual items in an order"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='order_items'
    )
    
    # Product snapshot
    product_name = models.CharField(max_length=255)
    product_image = models.TextField(blank=True, null=True)
    
    # Pricing at time of purchase
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'order_items'
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['product']),
        ]
    
    def __str__(self):
        return f"{self.product_name} x {self.quantity}"


# ============================================
# CART MODEL
# ============================================

class Cart(models.Model):
    """Shopping carts for users and sessions"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='carts'
    )
    session_id = models.CharField(max_length=255, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'carts'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['session_id']),
            models.Index(fields=['is_active']),
            models.Index(fields=['expires_at']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            from datetime import timedelta
            self.expires_at = timezone.now() + timedelta(days=30)
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.user:
            return f"Cart for {self.user.email}"
        return f"Cart {self.session_id}"


# ============================================
# CART ITEM MODEL
# ============================================

class CartItem(models.Model):
    """Products in shopping cart"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items'
    )
    
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cart_items'
        unique_together = [['cart', 'product']]
        indexes = [
            models.Index(fields=['cart']),
            models.Index(fields=['product']),
        ]
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


# ============================================
# REVIEW MODEL
# ============================================

class Review(models.Model):
    """Product reviews and ratings"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    user_name = models.CharField(max_length=255)
    
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        unique_together = [['product', 'user']]
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['user']),
            models.Index(fields=['rating']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user_name} - {self.product.name} ({self.rating}★)"


# ============================================
# STOCK MOVEMENT MODEL
# ============================================

class StockMovement(models.Model):
    """Inventory movements tracking"""
    
    TYPE_CHOICES = [
        ('in', 'Entrada'),
        ('out', 'Salida'),
        ('adjustment', 'Ajuste'),
        ('sale', 'Venta'),
        ('return', 'Devolución'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='stock_movements'
    )
    
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    quantity = models.IntegerField()
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    
    reference_id = models.UUIDField(blank=True, null=True)
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['type']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.product.name} ({self.quantity})"
