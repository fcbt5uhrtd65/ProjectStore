"""
URL configuration for API app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    register, login, current_user,
    CategoryViewSet, ProductViewSet, OrderViewSet,
    CartViewSet, ReviewViewSet, StockMovementViewSet
)

# Create router
router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')
router.register('orders', OrderViewSet, basename='order')
router.register('cart', CartViewSet, basename='cart')
router.register('reviews', ReviewViewSet, basename='review')
router.register('stock-movements', StockMovementViewSet, basename='stock-movement')

urlpatterns = [
    # Authentication
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/me/', current_user, name='current-user'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Router URLs
    path('', include(router.urls)),
]
