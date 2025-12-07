import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product, Category, StockMovement } from '../types';
import { productsApi, systemApi } from '../utils/supabase/client';
import { toast } from 'sonner';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getActiveProducts: () => Product[];
  getLowStockProducts: (threshold?: number) => Product[];
  getFeaturedProducts: () => Product[];
  getRecommendedProducts: () => Product[];
  getTopSellingProducts: (limit?: number) => Product[];
  getMostViewedProducts: (limit?: number) => Product[];
  incrementViewCount: (id: string) => Promise<void>;
  incrementSalesCount: (id: string, quantity: number) => Promise<void>;
  updateStock: (id: string, quantity: number, reason: string) => Promise<void>;
  getStockMovements: (productId?: string) => StockMovement[];
  searchProducts: (query: string) => Product[];
  filterProducts: (filters: ProductFilters) => Product[];
  loading: boolean;
}

interface ProductFilters {
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  onSale?: boolean;
  tags?: string[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Laptops', icon: '💻' },
  { id: '2', name: 'Smartphones', icon: '📱' },
  { id: '3', name: 'Audio', icon: '🎧' },
  { id: '4', name: 'Accesorios', icon: '⌨️' },
  { id: '5', name: 'Tablets', icon: '📲' },
  { id: '6', name: 'Gaming', icon: '🎮' }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro M3',
    description: 'Potencia profesional para creativos y desarrolladores con chip M3',
    price: 2499,
    category: 'Laptops',
    image: 'https://images.unsplash.com/photo-1505209487757-5114235191e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBkZXNrJTIwbWluaW1hbHxlbnwxfHx8fDE3NjUxMzYwNzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    stock: 15,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    description: 'Innovación en cada detalle con titanio premium y chip A17 Pro',
    price: 1199,
    category: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1676173646307-d050e097d181?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjUwODA4OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    stock: 25,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'AirPods Max',
    description: 'Audio de alta fidelidad con cancelación de ruido activa',
    price: 549,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzY1MTAwODU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    stock: 8,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Magic Keyboard',
    description: 'Teclado inalámbrico con diseño elegante y teclas precisas',
    price: 99,
    category: 'Accesorios',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
    stock: 30,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'iPad Pro 12.9"',
    description: 'Rendimiento extremo con chip M2 y pantalla Liquid Retina XDR',
    price: 1099,
    category: 'Tablets',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    stock: 12,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'PlayStation 5',
    description: 'Consola de nueva generación con gráficos 4K y SSD ultra rápido',
    price: 499,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
    stock: 5,
    active: true,
    createdAt: new Date().toISOString()
  }
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      
      if (!data.products || data.products.length === 0) {
        // Initialize with demo data if empty
        await systemApi.init();
        const newData = await productsApi.getAll();
        setProducts(newData.products || []);
      } else {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
      // Fallback to initial products if API fails
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const data = await productsApi.create(product);
      setProducts(prev => [...prev, data.product]);
      toast.success('Producto creado correctamente');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error al crear producto');
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const data = await productsApi.update(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? data.product : p));
      toast.success('Producto actualizado correctamente');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar producto');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: false } : p));
      toast.success('Producto desactivado');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al desactivar producto');
      throw error;
    }
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  const getActiveProducts = () => {
    return products.filter(p => p.active);
  };

  const getLowStockProducts = (threshold: number = 10) => {
    return products.filter(p => p.active && p.stock < threshold);
  };

  const getFeaturedProducts = () => {
    return products.filter(p => p.active && p.featured);
  };

  const getRecommendedProducts = () => {
    return products.filter(p => p.active && p.recommended);
  };

  const getTopSellingProducts = (limit: number = 5) => {
    return products.filter(p => p.active).sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, limit);
  };

  const getMostViewedProducts = (limit: number = 5) => {
    return products.filter(p => p.active).sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, limit);
  };

  const incrementViewCount = async (id: string) => {
    try {
      const data = await productsApi.incrementViewCount(id);
      setProducts(prev => prev.map(p => p.id === id ? data.product : p));
    } catch (error) {
      console.error('Error incrementing view count:', error);
      toast.error('Error al incrementar el contador de vistas');
      throw error;
    }
  };

  const incrementSalesCount = async (id: string, quantity: number) => {
    try {
      const data = await productsApi.incrementSalesCount(id, quantity);
      setProducts(prev => prev.map(p => p.id === id ? data.product : p));
    } catch (error) {
      console.error('Error incrementing sales count:', error);
      toast.error('Error al incrementar el contador de ventas');
      throw error;
    }
  };

  const updateStock = async (id: string, quantity: number, reason: string) => {
    try {
      const data = await productsApi.updateStock(id, quantity, reason);
      setProducts(prev => prev.map(p => p.id === id ? data.product : p));
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Error al actualizar el stock');
      throw error;
    }
  };

  const getStockMovements = () => {
    // Los movimientos de stock se manejan por separado, no en el producto
    return [];
  };

  const searchProducts = (query: string) => {
    return products.filter(p => p.active && p.name.toLowerCase().includes(query.toLowerCase()));
  };

  const filterProducts = (filters: ProductFilters) => {
    return products.filter(p => p.active && 
      (!filters.category || p.category === filters.category) &&
      (!filters.brand || p.brand === filters.brand) &&
      (!filters.color || p.color === filters.color) &&
      (!filters.size || p.size === filters.size) &&
      (!filters.material || p.material === filters.material) &&
      (!filters.minPrice || p.price >= filters.minPrice) &&
      (!filters.maxPrice || p.price <= filters.maxPrice) &&
      (!filters.inStock || p.stock > 0) &&
      (!filters.featured || p.featured) &&
      (!filters.onSale || (p.discount && p.discount > 0)) &&
      (!filters.tags || (p.tags && filters.tags.every(tag => p.tags!.includes(tag))))
    );
  };

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      getActiveProducts,
      getLowStockProducts,
      getFeaturedProducts,
      getRecommendedProducts,
      getTopSellingProducts,
      getMostViewedProducts,
      incrementViewCount,
      incrementSalesCount,
      updateStock,
      getStockMovements,
      searchProducts,
      filterProducts,
      loading
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}