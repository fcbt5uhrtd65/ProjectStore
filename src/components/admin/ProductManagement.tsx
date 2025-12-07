import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, Eye, EyeOff } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import type { Product } from '../../types';
import ProductModal from './ProductModal';

export function ProductManagement() {
  const { products, deleteProduct, updateProduct, categories } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesActive = showInactive || p.active;
    return matchesSearch && matchesCategory && matchesActive;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`¿Estás seguro de desactivar "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
      } catch (error) {
        // Error already handled
      }
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product.id, { active: !product.active });
    } catch (error) {
      // Error already handled
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2">Gestión de Productos</h1>
            <p className="text-purple-100">
              Administra tu catálogo completo - {filteredProducts.length} productos
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                showInactive
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
              }`}
            >
              {showInactive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="text-slate-600 dark:text-slate-400">
          Mostrando {filteredProducts.length} producto(s)
        </div>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-slate-900 dark:text-white mb-2">No se encontraron productos</h3>
          <p className="text-slate-600 dark:text-slate-400">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Intenta con otros filtros' 
              : 'Comienza agregando tu primer producto'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-900 dark:text-white">Producto</th>
                  <th className="px-6 py-4 text-left text-slate-900 dark:text-white">Categoría</th>
                  <th className="px-6 py-4 text-left text-slate-900 dark:text-white">Precio</th>
                  <th className="px-6 py-4 text-left text-slate-900 dark:text-white">Stock</th>
                  <th className="px-6 py-4 text-left text-slate-900 dark:text-white">Estado</th>
                  <th className="px-6 py-4 text-right text-slate-900 dark:text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={!product.active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="text-slate-900 dark:text-white">{product.name}</div>
                          <div className="text-slate-600 dark:text-slate-400 line-clamp-1">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full ${
                        product.stock === 0 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : product.stock < 10
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`inline-flex items-center px-3 py-1 rounded-full ${
                          product.active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {product.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Desactivar"
                        >
                          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}