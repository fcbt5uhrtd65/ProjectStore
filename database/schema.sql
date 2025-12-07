-- ============================================
-- PROJECTSTORE - BASE DE DATOS COMPLETA
-- Revisado según formularios, contextos y componentes
-- PostgreSQL 14+ / Supabase
-- ============================================

-- ============================================
-- EXTENSIONES NECESARIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. TABLA DE USUARIOS
-- Basado en: LoginModal.tsx, AuthContext.tsx
-- Campos: email, password, name, role
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Credenciales (LoginModal.tsx requiere email y password)
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Rol (AuthContext.tsx define 'admin' y 'client')
    role VARCHAR(20) DEFAULT 'client' NOT NULL CHECK (role IN ('admin', 'client')),
    
    -- Información personal
    name VARCHAR(255),
    phone VARCHAR(20),
    
    -- Dirección completa
    address TEXT,
    city VARCHAR(100),
    department VARCHAR(100),
    
    -- Estado y metadatos
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

COMMENT ON TABLE users IS 'Usuarios del sistema - administradores y clientes';
COMMENT ON COLUMN users.role IS 'Rol del usuario: admin o client';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt de la contraseña';

-- ============================================
-- 2. TABLA DE CATEGORÍAS
-- Basado en: ProductContext.tsx (categories array)
-- ProductModal.tsx usa select de categorías
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Jerarquía (categorías padre-hijo)
    parent_id UUID,
    
    -- Orden de visualización
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Índices para categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);

COMMENT ON TABLE categories IS 'Categorías de productos con soporte para jerarquías';

-- ============================================
-- 3. TABLA DE PRODUCTOS
-- Basado en: types/index.ts (Product interface)
-- ProductModal.tsx - todos los campos del formulario
-- ProductContext.tsx - operaciones y métricas
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica (ProductModal.tsx campos requeridos)
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    
    -- Categoría (ProductModal.tsx - select de categorías)
    category_id UUID NOT NULL,
    
    -- Precios e inventario (ProductModal.tsx - campos numéricos)
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discount DECIMAL(5, 2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    
    -- Código único del producto (ProductModal.tsx - campo sku)
    sku VARCHAR(100) UNIQUE,
    
    -- Imágenes (ProductModal.tsx - image field, ProductDetail.tsx muestra galería)
    image TEXT, -- Imagen principal
    images TEXT[] DEFAULT '{}', -- Array de imágenes adicionales
    
    -- Características del producto (ProductDetail.tsx los muestra)
    brand VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    material VARCHAR(100),
    weight DECIMAL(8, 2), -- en kg
    dimensions VARCHAR(100), -- ej: "10x20x30 cm"
    
    -- Información adicional
    warranty VARCHAR(255), -- Garantía del producto
    shipping VARCHAR(255), -- Información de envío
    returns VARCHAR(255), -- Política de devoluciones
    
    -- Features array (ProductDetail.tsx muestra lista de características)
    features TEXT[] DEFAULT '{}',
    
    -- Tags para búsqueda y filtrado (ProductModal.tsx - tags field)
    tags TEXT[] DEFAULT '{}',
    
    -- Estado del producto (ProductModal.tsx - active checkbox)
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false, -- Producto destacado
    recommended BOOLEAN DEFAULT false, -- Producto recomendado
    
    -- Precios especiales (types/index.ts incluye originalPrice)
    original_price DECIMAL(10, 2), -- Precio original antes de descuento
    offer_start_date TIMESTAMP WITH TIME ZONE,
    offer_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Métricas (ProductContext.tsx: viewCount, salesCount)
    view_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    
    -- Calificaciones (calculadas desde reviews)
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    
    -- Stock mínimo para alertas
    min_stock INTEGER DEFAULT 5 CHECK (min_stock >= 0),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_recommended ON products(recommended);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_sales_count ON products(sales_count DESC);
CREATE INDEX idx_products_view_count ON products(view_count DESC);
CREATE INDEX idx_products_rating ON products(rating DESC);

COMMENT ON TABLE products IS 'Catálogo de productos con información completa';
COMMENT ON COLUMN products.active IS 'Si el producto está activo y visible';
COMMENT ON COLUMN products.discount IS 'Porcentaje de descuento (0-100)';
COMMENT ON COLUMN products.tags IS 'Array de etiquetas para búsqueda y filtrado';

-- ============================================
-- 4. TABLA DE ÓRDENES
-- Basado en: types/index.ts (Order interface)
-- WhatsAppOrder.tsx - formulario de checkout
-- OrderContext.tsx - gestión de órdenes
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Usuario (puede ser NULL para guest checkout)
    user_id UUID,
    
    -- Información del cliente (WhatsAppOrder.tsx - campos del formulario)
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    
    -- Dirección de envío (WhatsAppOrder.tsx - campos de dirección)
    customer_address TEXT NOT NULL,
    
    -- Método de entrega (WhatsAppOrder.tsx - deliveryMethod select)
    delivery_method VARCHAR(50) DEFAULT 'Domicilio' NOT NULL,
    
    -- Totales (CartContext.tsx calcula estos valores)
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount DECIMAL(10, 2) DEFAULT 0 CHECK (discount >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    
    -- Estados (types/index.ts: OrderStatus type)
    status VARCHAR(20) DEFAULT 'pending' NOT NULL 
        CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
    
    -- Notas del pedido (WhatsAppOrder.tsx - notes textarea)
    notes TEXT,
    admin_notes TEXT, -- Notas internas del administrador
    
    -- Fechas importantes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para orders
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_customer_name ON orders(customer_name);

COMMENT ON TABLE orders IS 'Órdenes de compra con información de cliente y envío';
COMMENT ON COLUMN orders.order_number IS 'Número único de orden (generado automáticamente)';
COMMENT ON COLUMN orders.delivery_method IS 'Método de entrega: Domicilio o Recoger en tienda';

-- ============================================
-- 5. TABLA DE ITEMS DE ORDEN
-- Basado en: types/index.ts (CartItem interface en Order)
-- OrderContext.tsx guarda items de la orden
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID,
    
    -- Información del producto al momento de la compra (snapshot)
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    
    -- Precio y cantidad (valores al momento de la compra)
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Índices para order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

COMMENT ON TABLE order_items IS 'Items individuales de cada orden (snapshot del producto)';

-- ============================================
-- 6. TABLA DE CARRITOS
-- Basado en: CartContext.tsx
-- Maneja carritos de usuarios registrados y sesiones
-- ============================================
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id VARCHAR(255),
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Índices para carts
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_carts_is_active ON carts(is_active);
CREATE INDEX idx_carts_expires_at ON carts(expires_at);

COMMENT ON TABLE carts IS 'Carritos de compra activos por usuario o sesión';

-- ============================================
-- 7. TABLA DE ITEMS DE CARRITO
-- Basado en: CartContext.tsx (CartItem interface)
-- addToCart, updateQuantity, removeFromCart
-- ============================================
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL,
    product_id UUID NOT NULL,
    
    -- Cantidad del producto (CartContext.tsx maneja quantity)
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    UNIQUE(cart_id, product_id)
);

-- Índices para cart_items
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

COMMENT ON TABLE cart_items IS 'Productos agregados al carrito de compra';

-- ============================================
-- 8. TABLA DE RESEÑAS
-- Basado en: ProductDetail.tsx muestra reviews
-- types/index.ts no define Review pero el código lo usa
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- Calificación de 1 a 5 estrellas
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Comentario de la reseña
    comment TEXT NOT NULL,
    
    -- Nombre del usuario (para mostrar en reviews)
    user_name VARCHAR(255) NOT NULL,
    
    -- Verificación de compra
    is_verified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(product_id, user_id)
);

-- Índices para reviews
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

COMMENT ON TABLE reviews IS 'Reseñas y calificaciones de productos';

-- ============================================
-- 9. TABLA DE MOVIMIENTOS DE STOCK
-- Basado en: ProductContext.tsx (updateStock, getStockMovements)
-- AdminDashboard.tsx muestra movimientos de inventario
-- ============================================
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL,
    
    -- Tipo de movimiento (ProductContext.tsx: 'in', 'out', 'adjustment')
    type VARCHAR(50) NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'sale', 'return')),
    
    -- Cantidad del movimiento
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    
    -- Referencia al origen del movimiento
    reference_id UUID,
    reference_type VARCHAR(50),
    
    -- Razón del movimiento (ProductContext.tsx: updateStock reason param)
    reason TEXT,
    
    -- Usuario que realizó el movimiento
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para stock_movements
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

COMMENT ON TABLE stock_movements IS 'Historial de movimientos de inventario';
COMMENT ON COLUMN stock_movements.type IS 'Tipo: in (entrada), out (salida), adjustment (ajuste), sale (venta), return (devolución)';

-- ============================================
-- 10. TABLA DE SESIONES
-- Para manejo de autenticación JWT
-- AuthContext.tsx maneja login/logout
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    
    -- Información de la sesión
    ip_address INET,
    user_agent TEXT,
    
    -- Expiración de la sesión
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

COMMENT ON TABLE sessions IS 'Sesiones de usuario activas para autenticación';

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de orden único
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'ORD-' || 
                          TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || 
                          LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

COMMENT ON FUNCTION generate_order_number() IS 'Genera número de orden único en formato ORD-YYYYMMDD-XXXXXX';

-- Función para registrar movimientos de stock automáticamente
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.stock != NEW.stock THEN
        INSERT INTO stock_movements (
            product_id,
            type,
            quantity,
            previous_stock,
            new_stock,
            reason
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.stock > OLD.stock THEN 'in'
                ELSE 'out'
            END,
            NEW.stock - OLD.stock,
            OLD.stock,
            NEW.stock,
            'Actualización automática de stock'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_product_stock_movement
    AFTER UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION log_stock_movement();

COMMENT ON FUNCTION log_stock_movement() IS 'Registra automáticamente movimientos de stock cuando cambia el inventario';

-- Función para actualizar rating de productos
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        rating = (
            SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) 
            FROM reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

COMMENT ON FUNCTION update_product_rating() IS 'Actualiza rating promedio y contador de reviews cuando se modifica una reseña';

-- Función para actualizar sales_count al completar orden
CREATE OR REPLACE FUNCTION update_product_sales()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND (OLD IS NULL OR OLD.status != 'delivered') THEN
        UPDATE products p
        SET sales_count = sales_count + oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_sales_on_order
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_product_sales();

COMMENT ON FUNCTION update_product_sales() IS 'Incrementa contador de ventas cuando orden es entregada';

-- Función para reducir stock al confirmar orden
CREATE OR REPLACE FUNCTION reduce_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status = 'pending') THEN
        UPDATE products p
        SET stock = stock - oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND p.id = oi.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reduce_stock_on_order_confirm
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION reduce_stock_on_order();

COMMENT ON FUNCTION reduce_stock_on_order() IS 'Reduce stock de productos cuando orden es confirmada';

-- Función para generar slug automáticamente
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Convertir a minúsculas, reemplazar espacios y caracteres especiales por guiones
        NEW.slug := lower(regexp_replace(unaccent(NEW.name), '[^a-z0-9]+', '-', 'g'));
        -- Remover guiones al inicio y final
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_product_slug
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION generate_slug();

CREATE TRIGGER generate_category_slug
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION generate_slug();

COMMENT ON FUNCTION generate_slug() IS 'Genera slug URL-friendly a partir del nombre';

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de productos con información completa
CREATE OR REPLACE VIEW products_full AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    CASE 
        WHEN p.discount > 0 THEN ROUND(p.price * (1 - p.discount/100), 2)
        ELSE p.price
    END as final_price,
    CASE 
        WHEN p.stock <= p.min_stock THEN true
        ELSE false
    END as low_stock
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

COMMENT ON VIEW products_full IS 'Vista de productos con categoría y precio final calculado';

-- Vista de órdenes con información del cliente
CREATE OR REPLACE VIEW orders_with_details AS
SELECT 
    o.*,
    u.email as user_email,
    u.name as user_name,
    COUNT(DISTINCT oi.id) as total_items,
    SUM(oi.quantity) as total_quantity
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.email, u.name;

COMMENT ON VIEW orders_with_details IS 'Vista de órdenes con información del usuario y contadores';

-- Vista de productos más vendidos
CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.image,
    p.price,
    p.discount,
    p.stock,
    p.sales_count,
    p.rating,
    p.review_count,
    c.name as category_name,
    CASE 
        WHEN p.discount > 0 THEN ROUND(p.price * (1 - p.discount/100), 2)
        ELSE p.price
    END as final_price
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.active = true
ORDER BY p.sales_count DESC, p.rating DESC
LIMIT 20;

COMMENT ON VIEW top_selling_products IS 'Top 20 productos más vendidos activos';

-- Vista de productos con bajo stock
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock,
    p.min_stock,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.active = true 
  AND p.stock <= p.min_stock
ORDER BY p.stock ASC;

COMMENT ON VIEW low_stock_products IS 'Productos activos con stock bajo o agotado';

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar usuario admin por defecto
-- Email: admin@projectstore.com
-- Password: admin123 (CAMBIAR EN PRODUCCIÓN)
INSERT INTO users (email, password_hash, role, name, is_active, email_verified) VALUES
('admin@projectstore.com', crypt('admin123', gen_salt('bf')), 'admin', 'Administrador', true, true);

-- Insertar categorías iniciales
INSERT INTO categories (name, slug, description, is_active) VALUES
('Electrónica', 'electronica', 'Productos electrónicos y tecnología', true),
('Ropa y Moda', 'ropa-moda', 'Ropa, calzado y accesorios de moda', true),
('Hogar y Cocina', 'hogar-cocina', 'Artículos para el hogar y la cocina', true),
('Deportes', 'deportes', 'Equipamiento y ropa deportiva', true),
('Libros', 'libros', 'Libros físicos y digitales', true),
('Juguetes', 'juguetes', 'Juguetes y juegos para todas las edades', true),
('Belleza', 'belleza', 'Productos de belleza y cuidado personal', true),
('Mascotas', 'mascotas', 'Productos para el cuidado de mascotas', true);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (Opcional para Supabase)
-- ============================================

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para users (usuarios solo ven su información)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para orders (usuarios ven sus órdenes)
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Políticas para reviews (usuarios pueden crear y ver reviews)
CREATE POLICY "Anyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Comentario final
COMMENT ON DATABASE CURRENT_DATABASE() IS 'ProjectStore - Sistema completo de e-commerce';

-- Script completado exitosamente
-- Para ejecutar: psql -U usuario -d projectstore -f schema.sql
