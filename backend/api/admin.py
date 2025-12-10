"""
Django admin configuration for ProjectStore
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Category, Product, Order, OrderItem,
    Cart, CartItem, Review, StockMovement
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['email', 'name', 'phone']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('name', 'phone')}),
        ('Dirección', {'fields': ('address', 'city', 'department')}),
        ('Permisos', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Fechas', {'fields': ('last_login', 'created_at')}),
    )
    readonly_fields = ['created_at', 'last_login']
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'name', 'role'),
        }),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'display_order', 'is_active']
    list_filter = ['is_active', 'parent']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['display_order', 'name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'active', 'featured', 'sales_count']
    list_filter = ['active', 'featured', 'recommended', 'category', 'created_at']
    search_fields = ['name', 'sku', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['-created_at']
    readonly_fields = ['view_count', 'sales_count', 'rating', 'review_count']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'slug', 'description', 'category', 'sku')
        }),
        ('Precios e Inventario', {
            'fields': ('price', 'discount', 'original_price', 'stock', 'min_stock')
        }),
        ('Imágenes', {
            'fields': ('image', 'images')
        }),
        ('Características', {
            'fields': ('brand', 'color', 'size', 'material', 'weight', 'dimensions')
        }),
        ('Información Adicional', {
            'fields': ('warranty', 'shipping', 'returns', 'features', 'tags')
        }),
        ('Estado', {
            'fields': ('active', 'featured', 'recommended')
        }),
        ('Métricas', {
            'fields': ('view_count', 'sales_count', 'rating', 'review_count')
        }),
    )


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'product_name', 'price', 'quantity', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'total', 'status', 'created_at']
    list_filter = ['status', 'delivery_method', 'created_at']
    search_fields = ['order_number', 'customer_name', 'customer_phone', 'customer_email']
    ordering = ['-created_at']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Información de Orden', {
            'fields': ('order_number', 'user', 'status')
        }),
        ('Cliente', {
            'fields': ('customer_name', 'customer_phone', 'customer_email', 'customer_address')
        }),
        ('Entrega', {
            'fields': ('delivery_method',)
        }),
        ('Totales', {
            'fields': ('subtotal', 'discount', 'total')
        }),
        ('Notas', {
            'fields': ('notes', 'admin_notes')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user_name', 'rating', 'is_verified', 'created_at']
    list_filter = ['rating', 'is_verified', 'created_at']
    search_fields = ['product__name', 'user__email', 'comment']
    ordering = ['-created_at']


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['product', 'type', 'quantity', 'previous_stock', 'new_stock', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['product__name', 'reason']
    ordering = ['-created_at']
    readonly_fields = ['created_at']


# Register remaining models with default admin
admin.site.register(Cart)
admin.site.register(CartItem)
