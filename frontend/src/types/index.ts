export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[]; // Galería de imágenes
  stock: number;
  active: boolean;
  createdAt: string;
  
  // Descuentos y ofertas
  discount?: number; // Porcentaje de descuento
  originalPrice?: number; // Precio antes del descuento
  offerStartDate?: string;
  offerEndDate?: string;
  
  // Características del producto
  rating?: number;
  reviewCount?: number;
  features?: string[];
  warranty?: string;
  shipping?: string;
  returns?: string;
  
  // Etiquetas y filtros
  brand?: string;
  color?: string;
  size?: string;
  material?: string;
  tags?: string[];
  
  // Destacados y estadísticas
  featured?: boolean; // Producto destacado
  recommended?: boolean; // Recomendado
  viewCount?: number; // Contador de vistas
  salesCount?: number; // Contador de ventas
  
  // Variaciones
  variations?: ProductVariation[];
  
  // Inventario
  minStock?: number; // Stock mínimo antes de alerta
  sku?: string; // Código único del producto
}

export interface ProductVariation {
  id: string;
  name: string; // Ej: "Talla", "Color"
  options: VariationOption[];
}

export interface VariationOption {
  id: string;
  value: string; // Ej: "M", "Rojo"
  stock: number;
  priceAdjustment?: number; // Ajuste de precio para esta variación
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariations?: { [key: string]: string }; // Ej: { "Talla": "M", "Color": "Rojo" }
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client' | 'employee';
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderDate?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string; // Número de orden único
  items: CartItem[];
  total: number;
  subtotal: number;
  discount?: number;
  
  // Información del cliente
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerAddress?: string;
  
  // Detalles del pedido
  deliveryMethod: string;
  notes?: string; // Notas del cliente
  adminNotes?: string; // Notas internas del admin
  
  // Estado y fechas
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  
  // Seguimiento
  statusHistory?: StatusChange[];
}

export interface StatusChange {
  status: OrderStatus;
  date: string;
  changedBy?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  image?: string;
  active?: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface SalesStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  topSellingProducts: Product[];
  recentOrders: Order[];
  lowStockProducts: Product[];
  salesByCategory: { category: string; total: number; count: number }[];
  salesByMonth: { month: string; total: number; count: number }[];
}

export interface ShopSettings {
  shopName: string;
  shopLogo?: string;
  whatsappNumber: string;
  currency: string;
  currencySymbol: string;
  primaryColor?: string;
  secondaryColor?: string;
  messageTemplate?: string;
  minStockAlert: number;
  freeShippingThreshold?: number;
}
