# 🎯 RESUMEN DE MIGRACIÓN A DJANGO + DOCKER

## ✅ Archivos Creados

### Backend Django
- ✅ `backend/` - Proyecto Django completo
- ✅ `backend/requirements.txt` - Dependencias Python
- ✅ `backend/manage.py` - CLI de Django
- ✅ `backend/projectstore/settings.py` - Configuración Django
- ✅ `backend/projectstore/urls.py` - URLs principales
- ✅ `backend/api/models.py` - Modelos de base de datos
- ✅ `backend/api/serializers.py` - Serializers DRF
- ✅ `backend/api/views.py` - ViewSets y vistas
- ✅ `backend/api/urls.py` - URLs de la API
- ✅ `backend/api/permissions.py` - Permisos personalizados
- ✅ `backend/api/admin.py` - Panel de administración

### Docker
- ✅ `docker-compose.yml` - Orquestación de servicios
- ✅ `backend.Dockerfile` - Contenedor Django
- ✅ `frontend.Dockerfile` - Contenedor React

### Frontend
- ✅ `frontend/` - Código React movido
- ✅ `frontend/src/utils/api/client.ts` - Cliente API para Django

### Configuración
- ✅ `.env.example` - Variables de entorno
- ✅ `README.md` - Documentación completa
- ✅ `MIGRATION_GUIDE.md` - Guía de migración frontend
- ✅ `start.ps1` - Script de inicio rápido

## 🚀 Iniciar el Proyecto

### Opción 1: Script Automático (Recomendado)
```powershell
.\start.ps1
```

### Opción 2: Manual
```powershell
# 1. Crear .env
cp .env.example .env

# 2. Iniciar servicios
docker-compose up -d

# 3. Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# 4. Crear superusuario
docker-compose exec backend python manage.py createsuperuser
```

## 📍 URLs de Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/docs
- **PostgreSQL**: localhost:5432

## 🔑 Modelos Creados

### User (Custom)
- Email como username
- Roles: admin/client
- Información personal y dirección
- JWT authentication

### Product
- Catálogo completo
- Categorías, precios, descuentos
- Stock, SKU, imágenes
- Rating, reviews, métricas

### Order
- Órdenes de compra
- Items con snapshot de productos
- Estados: pending, confirmed, in_transit, delivered, cancelled

### Cart
- Carritos por usuario/sesión
- Items con cantidades
- API completa

### Category
- Categorías con jerarquía
- Productos relacionados

### Review
- Calificaciones 1-5 estrellas
- Comentarios verificados

### StockMovement
- Tracking de inventario
- Historial de movimientos

## 🎯 Endpoints Principales

### Auth
```
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/token/refresh/
GET  /api/auth/me/
```

### Products
```
GET    /api/products/
GET    /api/products/{slug}/
POST   /api/products/
PUT    /api/products/{slug}/
DELETE /api/products/{slug}/
GET    /api/products/featured/
GET    /api/products/recommended/
```

### Orders
```
GET   /api/orders/
POST  /api/orders/
GET   /api/orders/{id}/
PATCH /api/orders/{id}/update_status/
```

### Cart
```
GET    /api/cart/
POST   /api/cart/add_item/
PATCH  /api/cart/update_item/
DELETE /api/cart/remove_item/
POST   /api/cart/clear/
```

## 🔄 Siguiente Paso: Migrar Frontend

El frontend actual usa **Supabase**. Necesitas actualizar:

1. **AuthContext.tsx** - Cambiar a `authApi` de Django
2. **ProductContext.tsx** - Usar nuevos endpoints
3. **CartContext.tsx** - Implementar `cartApi`
4. **OrderContext.tsx** - Nueva estructura de órdenes
5. Componentes admin - Actualizar CRUD

**Lee `MIGRATION_GUIDE.md` para instrucciones detalladas**

## 🛠️ Comandos Útiles

### Ver Logs
```powershell
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Django
```powershell
# Shell interactivo
docker-compose exec backend python manage.py shell

# Crear app
docker-compose exec backend python manage.py startapp myapp

# Migraciones
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Collectstatic
docker-compose exec backend python manage.py collectstatic
```

### Base de Datos
```powershell
# Acceder a PostgreSQL
docker-compose exec db psql -U postgres -d projectstore_db

# Backup
docker-compose exec db pg_dump -U postgres projectstore_db > backup.sql

# Restore
cat backup.sql | docker-compose exec -T db psql -U postgres projectstore_db
```

### Frontend
```powershell
# Instalar paquete
docker-compose exec frontend npm install paquete

# Build producción
docker-compose exec frontend npm run build
```

### Docker
```powershell
# Detener todo
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir
docker-compose up --build

# Ver estado
docker-compose ps
```

## ⚠️ Notas Importantes

1. **Base de datos** - `database/schema.sql` se ejecuta automáticamente al crear el contenedor
2. **IDs son UUIDs** - Todos los IDs ahora son strings UUID, no números
3. **Slugs** - Productos y categorías usan slugs en URLs
4. **JWT** - Tokens se manejan automáticamente en localStorage
5. **CORS** - Ya configurado para `localhost:5173`
6. **Hot Reload** - Funciona en frontend y backend

## 🎨 Personalización

### Cambiar puertos
Edita `docker-compose.yml`:
```yaml
ports:
  - "TU_PUERTO:5173"  # Frontend
  - "TU_PUERTO:8000"  # Backend
```

### Variables de entorno
Edita `.env`:
```env
DB_PASSWORD=tu_password_seguro
DJANGO_SECRET_KEY=tu_secret_key
```

## 📚 Recursos

- **Django Docs**: https://docs.djangoproject.com/
- **DRF Docs**: https://www.django-rest-framework.org/
- **Docker Docs**: https://docs.docker.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## 🐛 Troubleshooting

### Error: Port already in use
```powershell
# Cambiar puertos en docker-compose.yml
# O detener proceso que usa el puerto
```

### Error: Database connection refused
```powershell
# Verificar que PostgreSQL esté healthy
docker-compose ps

# Ver logs
docker-compose logs db
```

### Error: CORS
```powershell
# Verificar CORS_ALLOWED_ORIGINS en .env
# Reiniciar backend
docker-compose restart backend
```

### Frontend no carga
```powershell
# Verificar logs
docker-compose logs frontend

# Reconstruir
docker-compose up --build frontend
```

## ✨ Características

- ✅ Django 4.2 + DRF
- ✅ PostgreSQL 15
- ✅ JWT Authentication
- ✅ Docker + Docker Compose
- ✅ Hot reload en desarrollo
- ✅ API documentation (Swagger)
- ✅ Django Admin Panel
- ✅ CORS configurado
- ✅ Modelos completos migrados
- ✅ Permisos por rol (admin/client)
- ✅ Paginación automática
- ✅ Filtros y búsqueda
- ✅ Gestión de stock
- ✅ Sistema de reviews
- ✅ Carritos de compra

## 🎉 ¡Listo!

Tu proyecto ahora tiene:
- ✅ Backend Django profesional
- ✅ API REST completa
- ✅ Docker configurado
- ✅ Base de datos PostgreSQL
- ✅ Documentación completa

**Próximo paso**: Ejecuta `.\start.ps1` y comienza a migrar el frontend! 🚀
