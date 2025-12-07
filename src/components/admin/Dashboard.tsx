import { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import { analyticsApi } from '../../utils/supabase/client';
import { ImageWithFallback } from '../figma/ImageWithFallback';

export function Dashboard() {
  const { loading } = useProducts();
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);
      const data = await analyticsApi.getDashboard();
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Productos',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Pedidos Totales',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Pedidos Pendientes',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/30',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2">Dashboard</h1>
            <p className="text-indigo-100">
              Resumen general de tu tienda TechStore
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group overflow-hidden"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
                </div>
                <div className={`text-xs ${stat.textColor} bg-gradient-to-r ${stat.color} bg-clip-text text-transparent opacity-60`}>
                  +12%
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">{stat.title}</div>
              <div className="text-3xl text-slate-900 dark:text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(stats.lowStockProducts > 0 || stats.productsOutOfStock > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {stats.lowStockProducts > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-3xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl text-orange-900 dark:text-orange-200 mb-2">Alerta: Stock Bajo</h3>
                  <p className="text-orange-700 dark:text-orange-300">
                    <span className="text-2xl">{stats.lowStockProducts}</span> producto(s) con menos de 10 unidades
                  </p>
                  <button className="mt-3 text-sm text-orange-600 dark:text-orange-400 hover:underline">
                    Ver productos →
                  </button>
                </div>
              </div>
            </div>
          )}

          {stats.productsOutOfStock > 0 && (
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl text-red-900 dark:text-red-200 mb-2">Productos Agotados</h3>
                  <p className="text-red-700 dark:text-red-300">
                    <span className="text-2xl">{stats.productsOutOfStock}</span> producto(s) sin stock
                  </p>
                  <button className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline">
                    Reabastecer →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders & Top Products */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl text-slate-900 dark:text-white">Pedidos Recientes</h3>
            <ShoppingCart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-3">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
                      {order.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-slate-900 dark:text-white mb-1">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg text-slate-900 dark:text-white mb-1">
                      ${order.total}
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : order.status === 'pending'
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay pedidos recientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl text-slate-900 dark:text-white">Productos Destacados</h3>
            <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="space-y-3">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-700/30 rounded-2xl hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-900 dark:text-white mb-1">
                      {product.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      ${product.price}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm px-3 py-1 rounded-lg ${
                      product.stock > 10 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : product.stock > 0
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      Stock: {product.stock}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay productos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}