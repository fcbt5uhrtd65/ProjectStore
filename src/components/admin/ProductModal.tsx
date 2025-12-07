import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Star, Tag, Package } from 'lucide-react';
import { useProducts } from '../../contexts/ProductContext';
import type { Product } from '../../types';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const { addProduct, updateProduct, categories } = useProducts();
  const [features, setFeatures] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);
  const [additionalImages, setAdditionalImages] = useState<string[]>(['']);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'pricing' | 'inventory' | 'seo'>('basic');

  const [formData, setFormData] = useState({
    // Básico
    name: '',
    description: '',
    category: categories[0]?.name || '',
    image: '',
    active: true,
    
    // Precios
    price: '',
    discount: '0',
    originalPrice: '',
    offerStartDate: '',
    offerEndDate: '',
    
    // Inventario
    stock: '',
    minStock: '5',
    sku: '',
    
    // Detalles del producto
    brand: '',
    color: '',
    size: '',
    material: '',
    warranty: '2 años',
    shipping: '24-48h',
    returns: '30 días',
    
    // Calificaciones
    rating: '5',
    reviewCount: '0',
    
    // Destacados
    featured: false,
    recommended: false
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || categories[0]?.name || '',
        image: product.image || '',
        active: product.active,
        price: product.price?.toString() || '',
        discount: product.discount?.toString() || '0',
        originalPrice: product.originalPrice?.toString() || '',
        offerStartDate: product.offerStartDate || '',
        offerEndDate: product.offerEndDate || '',
        stock: product.stock?.toString() || '',
        minStock: product.minStock?.toString() || '5',
        sku: product.sku || '',
        brand: product.brand || '',
        color: product.color || '',
        size: product.size || '',
        material: product.material || '',
        warranty: product.warranty || '2 años',
        shipping: product.shipping || '24-48h',
        returns: product.returns || '30 días',
        rating: product.rating?.toString() || '5',
        reviewCount: product.reviewCount?.toString() || '0',
        featured: product.featured || false,
        recommended: product.recommended || false
      });
      setFeatures(product.features && product.features.length > 0 ? product.features : ['']);
      setTags(product.tags && product.tags.length > 0 ? product.tags : ['']);
      setAdditionalImages(product.images && product.images.length > 0 ? product.images : ['']);
    }
  }, [product, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('Por favor completa todos los campos requeridos (Nombre, Precio, Stock)');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      image: formData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      images: additionalImages.filter(img => img.trim() !== ''),
      active: formData.active,
      
      price: parseFloat(formData.price),
      discount: parseFloat(formData.discount) || 0,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      offerStartDate: formData.offerStartDate || undefined,
      offerEndDate: formData.offerEndDate || undefined,
      
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock) || 5,
      sku: formData.sku || undefined,
      
      brand: formData.brand || undefined,
      color: formData.color || undefined,
      size: formData.size || undefined,
      material: formData.material || undefined,
      warranty: formData.warranty,
      shipping: formData.shipping,
      returns: formData.returns,
      
      rating: parseFloat(formData.rating) || 5,
      reviewCount: parseInt(formData.reviewCount) || 0,
      
      features: features.filter(f => f.trim() !== ''),
      tags: tags.filter(t => t.trim() !== ''),
      
      featured: formData.featured,
      recommended: formData.recommended,
      
      viewCount: product?.viewCount || 0,
      salesCount: product?.salesCount || 0
    };

    try {
      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      onClose();
    } catch (error) {
      // Error already handled in context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const handleAddTag = () => {
    setTags([...tags, '']);
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...additionalImages];
    newImages[index] = value;
    setAdditionalImages(newImages);
  };

  const handleAddImage = () => {
    setAdditionalImages([...additionalImages, '']);
  };

  const handleRemoveImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between">
            <h2 className="text-white text-2xl">
              {product ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div className="flex overflow-x-auto">
              {[
                { id: 'basic', label: 'Básico', icon: Package },
                { id: 'details', label: 'Detalles', icon: Star },
                { id: 'pricing', label: 'Precios', icon: Tag },
                { id: 'inventory', label: 'Inventario', icon: Package },
                { id: 'seo', label: 'Etiquetas', icon: Tag }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            {/* BASIC TAB */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">
                    Nombre del producto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                    placeholder="Ej: MacBook Pro M3"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none resize-none"
                    placeholder="Descripción detallada del producto..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">
                    Imagen principal
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-3">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-32 h-32 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">
                    Galería de imágenes
                  </label>
                  <div className="space-y-3">
                    {additionalImages.map((img, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="url"
                          value={img}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                          placeholder="URL de imagen adicional"
                        />
                        {additionalImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar imagen
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">Producto activo</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">⭐ Destacado</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="recommended"
                      checked={formData.recommended}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300">✨ Recomendado</span>
                  </label>
                </div>
              </div>
            )}

            {/* DETAILS TAB */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Marca
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="Ej: Apple, Samsung, Sony"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="Ej: Negro, Blanco, Azul"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Tamaño / Talla
                    </label>
                    <input
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="Ej: 14 pulgadas, M, L"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Material
                    </label>
                    <input
                      type="text"
                      name="material"
                      value={formData.material}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="Ej: Aluminio, Plástico, Titanio"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Garantía
                    </label>
                    <input
                      type="text"
                      name="warranty"
                      value={formData.warranty}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="Ej: 2 años, 1 año"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Tiempo de envío
                    </label>
                    <input
                      type="text"
                      name="shipping"
                      value={formData.shipping}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="Ej: 24-48h, 2-3 días"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Política de devolución
                    </label>
                    <input
                      type="text"
                      name="returns"
                      value={formData.returns}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="Ej: 30 días, 15 días"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Calificación (0-5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Número de reseñas
                    </label>
                    <input
                      type="number"
                      name="reviewCount"
                      value={formData.reviewCount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">
                    Características destacadas
                  </label>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                          placeholder="Ej: Producto 100% original y certificado"
                        />
                        {features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(index)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar característica
                  </button>
                </div>
              </div>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Precio actual ($) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Precio original ($)
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Precio con descuento (calculado)
                    </label>
                    <div className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white">
                      ${formData.price && formData.discount ? (parseFloat(formData.price) * (1 - parseFloat(formData.discount) / 100)).toFixed(2) : '0.00'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Inicio de oferta
                    </label>
                    <input
                      type="date"
                      name="offerStartDate"
                      value={formData.offerStartDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Fin de oferta
                    </label>
                    <input
                      type="date"
                      name="offerEndDate"
                      value={formData.offerEndDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                    />
                  </div>
                </div>

                {parseFloat(formData.discount) > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="text-green-900 dark:text-green-100">
                          Oferta activa: {formData.discount}% de descuento
                        </div>
                        <div className="text-green-700 dark:text-green-300 text-sm">
                          Ahorro: ${formData.price ? (parseFloat(formData.price) * parseFloat(formData.discount) / 100).toFixed(2) : '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Stock actual *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      Stock mínimo (alerta)
                    </label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="5"
                    />
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Recibirás una alerta cuando el stock sea menor a este valor
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-2">
                      SKU (Código único)
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                      placeholder="Ej: MBP-M3-2024"
                    />
                  </div>
                </div>

                {formData.stock && parseInt(formData.stock) < parseInt(formData.minStock) && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <div className="text-amber-900 dark:text-amber-100">
                          ⚠️ Stock bajo
                        </div>
                        <div className="text-amber-700 dark:text-amber-300 text-sm">
                          El stock actual ({formData.stock}) está por debajo del mínimo ({formData.minStock})
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formData.stock && parseInt(formData.stock) === 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <div>
                        <div className="text-red-900 dark:text-red-100">
                          ❌ Sin stock
                        </div>
                        <div className="text-red-700 dark:text-red-300 text-sm">
                          Este producto no estará disponible para compra
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEO TAB */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-2">
                    Etiquetas (Tags)
                  </label>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    Ayudan a filtrar y buscar productos más fácilmente
                  </p>
                  <div className="space-y-3">
                    {tags.map((tag, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => handleTagChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                          placeholder="Ej: nuevo, oferta, premium, destacado"
                        />
                        {tags.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar etiqueta
                  </button>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                  <div className="text-indigo-900 dark:text-indigo-100 mb-2">
                    💡 Sugerencias de etiquetas populares:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['nuevo', 'oferta', 'premium', 'destacado', 'mejor vendido', 'limitado', 'exclusivo', 'eco-friendly'].map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          if (!tags.includes(suggestion)) {
                            setTags([...tags.filter(t => t !== ''), suggestion]);
                          }
                        }}
                        className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-6 flex gap-4 bg-slate-50 dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              {product ? 'Actualizar' : 'Crear'} producto
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductModal;
