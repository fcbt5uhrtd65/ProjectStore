# ProjectStore - E-commerce Platform

E-commerce platform built with **Django REST Framework** backend and **React + Vite** frontend, containerized with **Docker**.

## 🚀 Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API toolkit
- **PostgreSQL 15** - Database
- **JWT Authentication** - Token-based auth
- **Docker** - Containerization

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library

## 📦 Project Structure

```
ProjectStore/
├── backend/                 # Django backend
│   ├── api/                # API app
│   │   ├── models.py      # Database models
│   │   ├── serializers.py # DRF serializers
│   │   ├── views.py       # API views
│   │   ├── urls.py        # API URLs
│   │   └── admin.py       # Django admin
│   ├── projectstore/       # Django project settings
│   ├── manage.py          # Django management
│   └── requirements.txt   # Python dependencies
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utilities & API client
│   │   └── types/         # TypeScript types
│   └── package.json       # Node dependencies
│
├── database/              # Database files
│   └── schema.sql        # PostgreSQL schema
│
├── docker-compose.yml    # Docker orchestration
├── backend.Dockerfile    # Backend container
├── frontend.Dockerfile   # Frontend container
└── .env.example          # Environment variables template
```

## 🐳 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Git

### 1️⃣ Clone the repository

```bash
git clone <your-repo-url>
cd ProjectStore
```

### 2️⃣ Create environment file

```bash
cp .env.example .env
```

Edit `.env` and update the values as needed.

### 3️⃣ Start all services

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on port `5432`
- **Django backend** on port `8000`
- **React frontend** on port `5173`

### 4️⃣ Create Django superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### 5️⃣ Access the application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/docs

## 🛠️ Development

### Backend Development

```bash
# View backend logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend python manage.py migrate

# Create new migration
docker-compose exec backend python manage.py makemigrations

# Django shell
docker-compose exec backend python manage.py shell

# Run tests
docker-compose exec backend python manage.py test
```

### Frontend Development

```bash
# View frontend logs
docker-compose logs -f frontend

# Install new package
docker-compose exec frontend npm install <package-name>

# Build for production
docker-compose exec frontend npm run build
```

### Database

```bash
# Access PostgreSQL
docker-compose exec db psql -U postgres -d projectstore_db

# Backup database
docker-compose exec db pg_dump -U postgres projectstore_db > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U postgres projectstore_db
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/me/` - Get current user

### Products
- `GET /api/products/` - List products
- `GET /api/products/{slug}/` - Product detail
- `POST /api/products/` - Create product (admin)
- `PUT /api/products/{slug}/` - Update product (admin)
- `DELETE /api/products/{slug}/` - Delete product (admin)

### Orders
- `GET /api/orders/` - List user orders
- `POST /api/orders/` - Create order
- `GET /api/orders/{id}/` - Order detail
- `PATCH /api/orders/{id}/update_status/` - Update status (admin)

### Cart
- `GET /api/cart/` - Get cart
- `POST /api/cart/add_item/` - Add to cart
- `PATCH /api/cart/update_item/` - Update quantity
- `DELETE /api/cart/remove_item/` - Remove item
- `POST /api/cart/clear/` - Clear cart

### Categories
- `GET /api/categories/` - List categories
- `GET /api/categories/{slug}/` - Category detail

### Reviews
- `GET /api/reviews/` - List reviews
- `POST /api/reviews/` - Create review
- `PUT /api/reviews/{id}/` - Update review
- `DELETE /api/reviews/{id}/` - Delete review

## 🔒 Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DJANGO_SECRET_KEY` - Django secret key (change in production!)
- `DJANGO_DEBUG` - Debug mode (False in production)
- `DB_PASSWORD` - PostgreSQL password
- `CORS_ALLOWED_ORIGINS` - Allowed frontend origins

## 🚢 Production Deployment

### Backend
1. Set `DJANGO_DEBUG=False`
2. Generate strong `DJANGO_SECRET_KEY`
3. Configure `DJANGO_ALLOWED_HOSTS`
4. Use managed PostgreSQL (AWS RDS, Neon, etc.)
5. Deploy to Railway, Render, or AWS

### Frontend
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or Cloudflare Pages
3. Update `VITE_API_URL` to production backend URL

## 📝 Database Models

- **User** - Custom user model with roles (admin/client)
- **Category** - Product categories with hierarchy
- **Product** - Product catalog with full details
- **Order** - Customer orders
- **OrderItem** - Order line items
- **Cart** - Shopping carts
- **CartItem** - Cart items
- **Review** - Product reviews and ratings
- **StockMovement** - Inventory tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Container won't start
```bash
docker-compose down -v
docker-compose up --build
```

### Database connection error
Check that PostgreSQL is healthy:
```bash
docker-compose ps
docker-compose logs db
```

### Frontend can't connect to backend
Verify CORS settings in `backend/projectstore/settings.py`

### Hot reload not working
Make sure volumes are properly mounted in `docker-compose.yml`  