# 📋 Guía de Migración del Frontend

Esta guía te ayudará a migrar el frontend de **Supabase** a la nueva **API de Django**.

## 🔄 Cambios Principales

### 1. Cliente API

**Antes (Supabase):**
```typescript
import { productsApi } from '@/utils/supabase/client';
```

**Después (Django):**
```typescript
import { productsApi } from '@/utils/api/client';
```

### 2. Autenticación

**Antes (Supabase Auth):**
```typescript
const { data: { user } } = await supabase.auth.getUser();
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**Después (Django JWT):**
```typescript
import { authApi } from '@/utils/api/client';

const user = await authApi.getCurrentUser();
const user = await authApi.login(email, password);
await authApi.logout();
```

### 3. Productos

**Antes:**
```typescript
const products = await productsApi.getAll();
const product = await productsApi.getById(id);
```

**Después:**
```typescript
const products = await productsApi.getAll({ active: true });
const product = await productsApi.getBySlug(slug); // Ahora usa slug
```

### 4. Órdenes

**Antes:**
```typescript
const orders = await ordersApi.getAll();
const order = await ordersApi.create(orderData);
```

**Después:**
```typescript
const orders = await ordersApi.getAll(); // Requiere autenticación
const order = await ordersApi.create({
  customer_name,
  customer_phone,
  customer_email,
  customer_address,
  delivery_method,
  subtotal,
  discount,
  total,
  notes,
  items: [
    {
      product: productId,
      product_name,
      product_image,
      price,
      quantity,
      subtotal
    }
  ]
});
```

### 5. Carrito

**Nuevo en Django:**
```typescript
import { cartApi } from '@/utils/api/client';

// Obtener carrito
const cart = await cartApi.get();

// Agregar item
await cartApi.addItem(productId, quantity);

// Actualizar cantidad
await cartApi.updateItem(itemId, newQuantity);

// Eliminar item
await cartApi.removeItem(itemId);

// Limpiar carrito
await cartApi.clear();
```

## 📝 Archivos a Actualizar

### Contextos que necesitan cambios:

1. **`src/contexts/AuthContext.tsx`**
   - Reemplazar Supabase Auth con `authApi`
   - Usar JWT tokens en lugar de sesiones Supabase
   - Actualizar métodos login/logout/register

2. **`src/contexts/ProductContext.tsx`**
   - Cambiar llamadas de `productsApi.getById()` a `productsApi.getBySlug()`
   - Actualizar estructura de datos (ahora `id` es UUID string, no number)

3. **`src/contexts/OrderContext.tsx`**
   - Actualizar creación de órdenes con nueva estructura
   - Manejar autenticación requerida

4. **`src/contexts/CartContext.tsx`**
   - Implementar llamadas a `cartApi` del backend
   - Sincronizar carrito local con servidor

### Componentes que necesitan cambios:

1. **`src/components/LoginModal.tsx`**
   - Usar `authApi.login()` en lugar de Supabase

2. **`src/components/client/ProductCatalog.tsx`**
   - Actualizar filtros y búsqueda

3. **`src/components/client/ProductDetail.tsx`**
   - Usar `slug` en lugar de `id` para rutas

4. **`src/components/client/WhatsAppOrder.tsx`**
   - Actualizar estructura de creación de orden

5. **`src/components/admin/*`**
   - Actualizar todas las operaciones CRUD
   - Verificar permisos de admin

## 🔑 Variables de Entorno

Agregar al archivo `.env` en la raíz del proyecto frontend:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 📊 Cambios en Tipos

### User Type
```typescript
// Antes
interface User {
  id: number;
  email: string;
  role: 'admin' | 'client';
}

// Después
interface User {
  id: string; // UUID
  email: string;
  name?: string;
  role: 'admin' | 'client';
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
}
```

### Product Type
```typescript
// Cambios principales:
- id: number → id: string (UUID)
- categoryId → category (UUID)
+ category_name (read-only)
+ final_price (calculated)
+ is_low_stock (boolean)
```

### Order Type
```typescript
// Cambios principales:
+ order_number (string único)
- userId → user (UUID, nullable)
+ items (array de OrderItem)
```

## ⚠️ Consideraciones Importantes

1. **IDs son UUIDs** - Todos los IDs ahora son strings UUID, no números
2. **Slugs en rutas** - Productos y categorías usan `slug` en endpoints
3. **Autenticación JWT** - Los tokens se manejan automáticamente en localStorage
4. **Paginación** - El backend pagina automáticamente (20 items por página)
5. **CORS** - Ya está configurado en el backend para `localhost:5173`

## 🚀 Orden de Migración Recomendado

1. ✅ Actualizar `AuthContext.tsx` primero
2. ✅ Actualizar `ProductContext.tsx`
3. ✅ Actualizar componentes de cliente (catálogo, detalle)
4. ✅ Actualizar `CartContext.tsx`
5. ✅ Actualizar `OrderContext.tsx` y WhatsApp checkout
6. ✅ Actualizar componentes de admin al final

## 🧪 Testing

Después de cada cambio, verificar:
- ✅ Login/Logout funciona
- ✅ Productos se cargan correctamente
- ✅ Carrito funciona (agregar/quitar/actualizar)
- ✅ Órdenes se crean correctamente
- ✅ Admin puede hacer CRUD de productos
- ✅ Hot reload funciona en Docker

## 📚 Recursos

- **API Docs**: http://localhost:8000/api/docs (Swagger UI)
- **Django Admin**: http://localhost:8000/admin
- **Cliente API**: `frontend/src/utils/api/client.ts`
