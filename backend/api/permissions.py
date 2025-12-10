"""
Custom permissions for ProjectStore API
"""
from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Permission to only allow admin users
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to only allow owners of an object or admins to edit it
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Admins can do anything
        if request.user.role == 'admin':
            return True
        
        # Check if user is the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False
