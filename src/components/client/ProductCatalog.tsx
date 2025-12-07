import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ShoppingCart, Package, Sparkles, TrendingUp, Laptop, Smartphone, Headphones, Keyboard, Tablet, Gamepad2, ArrowRight } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

interface ProductCatalogProps {
  onLoginRequired: () => void;
  onProductClick: (productId: string) => void;
}

export function ProductCatalog({ onLoginRequired, onProductClick }: ProductCatalogProps) {
  const { getActiveProducts, categories } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');

  // Get icon component for category
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, any> = {
      'Laptops': Laptop,
      'Smartphones': Smartphone,
      'Audio': Headphones,
      'Accesorios': Keyboard,
      'Tablets': Tablet,
      'Gaming': Gamepad2
    };
    return iconMap[categoryName] || Package;
  };

  const filteredProducts = useMemo(() => {
    let products = getActiveProducts();

    if (selectedCategory !== 'Todos') {
      products = products.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceRange !== 'all') {
      products = products.filter(p => {
        if (priceRange === 'low') return p.price < 300;
        if (priceRange === 'mid') return p.price >= 300 && p.price <= 1000;
        if (priceRange === 'high') return p.price > 1000;
        return true;
      });
    }

    return products;
  }, [getActiveProducts, selectedCategory, searchTerm, priceRange]);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (!user) {
      toast.info('Inicia sesión para agregar productos al carrito');
      onLoginRequired();
      return;
    }
    
    if (product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-white text-[36px]">Catálogo de Productos</h1>
            <p className="text-slate-600 dark:text-slate-400">
              {filteredProducts.length} productos disponibles
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="text-slate-700 dark:text-slate-300 mb-2 block">Rango de precio</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'low', label: '&lt; $300' },
                  { value: 'mid', label: '$300 - $1000' },
                  { value: 'high', label: '&gt; $1000' }
                ].map(range => (
                  <button
                    key={range.value}
                    onClick={() => setPriceRange(range.value as any)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      priceRange === range.value
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`px-6 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === 'Todos'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category.name);
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onProductClick(product.id)}
            className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Image Container */}
            <div className="relative h-80 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Badges */}
              {product.stock === 0 ? (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg backdrop-blur-sm">
                  <Package className="w-4 h-4" />
                  <span>Sin stock</span>
                </div>
              ) : product.stock < 10 ? (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Últimas {product.stock} unidades</span>
                </div>
              ) : (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg backdrop-blur-sm">
                  <Package className="w-4 h-4" />
                  <span>Disponible</span>
                </div>
              )}

              {product.price > 1000 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg backdrop-blur-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Premium</span>
                </div>
              )}

              {/* Quick Add Button */}
              <button
                onClick={(e) => handleQuickAdd(e, product)}
                disabled={product.stock === 0}
                className="absolute bottom-4 right-4 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
              >
                <ShoppingCart className="w-6 h-6" />
              </button>
            </div>

            {/* Info */}
            <div className="p-6 space-y-4">
              {/* Category Badge */}
              <div className="inline-flex items-center px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs">
                {product.category}
              </div>

              {/* Title */}
              <h3 className="text-slate-900 dark:text-white text-xl line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                {product.name}
              </h3>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              {/* Divider */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mb-1">Precio</div>
                    <div className="text-3xl text-slate-900 dark:text-white flex items-start">
                      <span className="text-lg mt-1">$</span>{product.price}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Stock: {product.stock}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-300">
                    <span>Ver más</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}