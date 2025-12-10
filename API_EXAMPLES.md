# 📖 Ejemplos de Uso del API

## 🔐 Autenticación

### Registro de Usuario
```javascript
const response = await fetch('http://localhost:8000/api/auth/register/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure_password',
    password_confirm: 'secure_password',
    name: 'John Doe',
    phone: '+57 300 123 4567'
  })
});

const data = await response.json();
// { user: {...}, tokens: { access: '...', refresh: '...' } }
```

### Login
```javascript
const response = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure_password'
  })
});

const { user, tokens } = await response.json();
localStorage.setItem('access_token', tokens.access);
localStorage.setItem('refresh_token', tokens.refresh);
```

### Obtener Usuario Actual
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/auth/me/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const user = await response.json();
```

### Refresh Token
```javascript
const refreshToken = localStorage.getItem('refresh_token');
const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh: refreshToken })
});

const { access } = await response.json();
localStorage.setItem('access_token', access);
```

## 📦 Productos

### Listar Productos
```javascript
// Todos los productos activos
const response = await fetch('http://localhost:8000/api/products/?active=true');
const products = await response.json();

// Con paginación
const page2 = await fetch('http://localhost:8000/api/products/?page=2');

// Filtrar por categoría
const filtered = await fetch('http://localhost:8000/api/products/?category=uuid-aqui');

// Buscar
const search = await fetch('http://localhost:8000/api/products/?search=laptop');

// Ordenar
const sorted = await fetch('http://localhost:8000/api/products/?ordering=-price');
```

### Obtener Producto por Slug
```javascript
const response = await fetch('http://localhost:8000/api/products/laptop-hp-15/');
const product = await response.json();
```

### Productos Destacados
```javascript
const response = await fetch('http://localhost:8000/api/products/featured/');
const featured = await response.json();
```

### Productos Recomendados
```javascript
const response = await fetch('http://localhost:8000/api/products/recommended/');
const recommended = await response.json();
```

### Buscar Productos
```javascript
const query = 'laptop';
const response = await fetch(`http://localhost:8000/api/products/search/?q=${query}`);
const results = await response.json();
```

### Crear Producto (Admin)
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/products/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Laptop HP 15',
    slug: 'laptop-hp-15',
    description: 'Laptop potente para trabajo',
    category: 'category-uuid',
    price: 1500000,
    discount: 10,
    stock: 50,
    sku: 'LAP-HP-001',
    image: 'https://example.com/image.jpg',
    images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    brand: 'HP',
    color: 'Silver',
    features: ['Intel i5', '8GB RAM', '256GB SSD'],
    tags: ['laptop', 'hp', 'computador'],
    active: true,
    featured: false
  })
});
```

### Actualizar Producto (Admin)
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/products/laptop-hp-15/', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    // Todos los campos del producto
    price: 1350000, // Nuevo precio
    stock: 45 // Nuevo stock
  })
});
```

## 🛒 Carrito

### Obtener Carrito
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/cart/', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const cart = await response.json();
// { id, items: [...], total: 150000 }
```

### Agregar al Carrito
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/cart/add_item/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    product_id: 'product-uuid',
    quantity: 2
  })
});

const updatedCart = await response.json();
```

### Actualizar Cantidad
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/cart/update_item/', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    item_id: 'cart-item-uuid',
    quantity: 5
  })
});
```

### Eliminar Item
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/cart/remove_item/', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    item_id: 'cart-item-uuid'
  })
});
```

### Limpiar Carrito
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/cart/clear/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🛍️ Órdenes

### Listar Órdenes del Usuario
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/orders/', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const orders = await response.json();
```

### Crear Orden
```javascript
// No requiere autenticación (guest checkout)
const response = await fetch('http://localhost:8000/api/orders/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_name: 'Juan Pérez',
    customer_phone: '+57 300 123 4567',
    customer_email: 'juan@example.com',
    customer_address: 'Calle 123 #45-67',
    delivery_method: 'Domicilio',
    subtotal: 150000,
    discount: 0,
    total: 150000,
    notes: 'Entregar en la tarde',
    items: [
      {
        product: 'product-uuid',
        product_name: 'Laptop HP 15',
        product_image: 'https://example.com/img.jpg',
        price: 1500000,
        quantity: 1,
        subtotal: 1500000
      }
    ]
  })
});

const order = await response.json();
// { id, order_number: 'ORD-20241210123456', ... }
```

### Obtener Detalle de Orden
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/orders/order-uuid/', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const order = await response.json();
```

### Actualizar Estado (Admin)
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/orders/order-uuid/update_status/', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'confirmed' // pending, confirmed, in_transit, delivered, cancelled
  })
});
```

## 🏷️ Categorías

### Listar Categorías
```javascript
const response = await fetch('http://localhost:8000/api/categories/');
const categories = await response.json();
```

### Obtener Categoría
```javascript
const response = await fetch('http://localhost:8000/api/categories/laptops/');
const category = await response.json();
```

### Crear Categoría (Admin)
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/categories/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Laptops',
    slug: 'laptops',
    description: 'Computadores portátiles',
    image_url: 'https://example.com/category.jpg',
    display_order: 1,
    is_active: true
  })
});
```

## ⭐ Reviews

### Listar Reviews de Producto
```javascript
const response = await fetch('http://localhost:8000/api/reviews/?product=product-uuid');
const reviews = await response.json();
```

### Crear Review
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('http://localhost:8000/api/reviews/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    product: 'product-uuid',
    rating: 5,
    comment: 'Excelente producto, muy recomendado'
  })
});
```

## 🎯 Usando el Cliente TypeScript

```typescript
import api from '@/utils/api/client';

// Auth
const user = await api.auth.login('email@example.com', 'password');
const currentUser = await api.auth.getCurrentUser();
await api.auth.logout();

// Products
const products = await api.products.getAll({ active: true });
const product = await api.products.getBySlug('laptop-hp-15');
const featured = await api.products.getFeatured();

// Cart
const cart = await api.cart.get();
await api.cart.addItem('product-uuid', 2);
await api.cart.updateItem('item-uuid', 5);
await api.cart.removeItem('item-uuid');

// Orders
const orders = await api.orders.getAll();
const order = await api.orders.create(orderData);

// Categories
const categories = await api.categories.getAll();

// Reviews
const reviews = await api.reviews.getByProduct('product-uuid');
await api.reviews.create({ product: 'uuid', rating: 5, comment: 'Great!' });
```

## 🔍 Filtros Avanzados

### Productos
```javascript
// Múltiples filtros
const url = new URL('http://localhost:8000/api/products/');
url.searchParams.append('category', 'category-uuid');
url.searchParams.append('active', 'true');
url.searchParams.append('featured', 'true');
url.searchParams.append('search', 'laptop');
url.searchParams.append('ordering', '-price');
url.searchParams.append('page', '2');

const response = await fetch(url);
```

### Reviews
```javascript
// Filtrar por rating
const response = await fetch('http://localhost:8000/api/reviews/?rating=5');
```

## 📊 Paginación

Todas las listas están paginadas (20 items por página):

```javascript
const response = await fetch('http://localhost:8000/api/products/');
const data = await response.json();

console.log(data.count);      // Total de items
console.log(data.next);       // URL de siguiente página
console.log(data.previous);   // URL de página anterior
console.log(data.results);    // Items de la página actual
```

## 🔄 Manejo de Errores

```javascript
try {
  const response = await fetch('http://localhost:8000/api/products/');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }
  
  const data = await response.json();
  // Success
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error
}
```

## 🎨 Respuestas de Ejemplo

### Product
```json
{
  "id": "uuid-here",
  "name": "Laptop HP 15",
  "slug": "laptop-hp-15",
  "description": "Laptop potente",
  "category": "category-uuid",
  "category_name": "Laptops",
  "price": "1500000.00",
  "discount": "10.00",
  "final_price": "1350000.00",
  "stock": 50,
  "sku": "LAP-HP-001",
  "image": "https://example.com/img.jpg",
  "images": ["img1.jpg", "img2.jpg"],
  "brand": "HP",
  "color": "Silver",
  "features": ["Intel i5", "8GB RAM"],
  "tags": ["laptop", "hp"],
  "active": true,
  "featured": false,
  "rating": "4.50",
  "review_count": 10,
  "is_low_stock": false
}
```

### Order
```json
{
  "id": "uuid-here",
  "order_number": "ORD-20241210123456",
  "customer_name": "Juan Pérez",
  "customer_phone": "+57 300 123 4567",
  "customer_email": "juan@example.com",
  "customer_address": "Calle 123",
  "delivery_method": "Domicilio",
  "subtotal": "150000.00",
  "discount": "0.00",
  "total": "150000.00",
  "status": "pending",
  "notes": "Entregar en la tarde",
  "items": [
    {
      "id": "item-uuid",
      "product": "product-uuid",
      "product_name": "Laptop HP 15",
      "price": "1500000.00",
      "quantity": 1,
      "subtotal": "1500000.00"
    }
  ],
  "created_at": "2024-12-10T12:34:56Z"
}
```
