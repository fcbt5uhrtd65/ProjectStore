import { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingCart, Heart, Share2, Check, Star, 
  Truck, Shield, RotateCcw, Sparkles, Package, Zap
} from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onLoginRequired: () => void;
}

export function ProductDetail({ productId, onBack, onLoginRequired }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { getProductById, getActiveProducts } = useProducts();
  const { user } = useAuth();

  useEffect(() => {
    const foundProduct = getProductById(productId);
    if (foundProduct) {
      setProduct(foundProduct);
    }
  }, [productId, getProductById]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando producto...</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.info('Inicia sesión para agregar productos al carrito');
      onLoginRequired();
      return;
    }
    
    if (product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`${quantity} ${quantity === 1 ? 'producto agregado' : 'productos agregados'} al carrito`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch((error) => {
        // Si el usuario cancela o hay error, usar clipboard como fallback
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(window.location.href)
            .then(() => toast.success('Link copiado al portapapeles'))
            .catch(() => toast.error('No se pudo compartir'));
        }
      });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copiado al portapapeles'))
        .catch(() => toast.error('No se pudo copiar el link'));
    }
  };

  const relatedProducts = getActiveProducts()
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header Fixed */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:bg-white/20 px-4 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <div className="flex items-center gap-2 text-white bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <Package className="w-4 h-4" />
            {product.category}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Main Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-800 p-8 border border-slate-200 dark:border-slate-700 group">
              {/* Stock Badge */}
              {product.stock > 0 ? (
                <div className="absolute top-6 left-6 z-10 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  En stock ({product.stock} disponibles)
                </div>
              ) : (
                <div className="absolute top-6 left-6 z-10 bg-red-500 text-white px-4 py-2 rounded-full">
                  Sin stock
                </div>
              )}

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Heart 
                  className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} 
                />
              </button>

              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-contain group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-center transform hover:scale-105 transition-all">
                <Truck className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-white">Envío</div>
                <div className="text-white/80">{product.shipping || '24-48h'}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 text-center transform hover:scale-105 transition-all">
                <Shield className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-white">Garantía</div>
                <div className="text-white/80">{product.warranty || '2 años'}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-center transform hover:scale-105 transition-all">
                <RotateCcw className="w-6 h-6 text-white mx-auto mb-2" />
                <div className="text-white">Devolución</div>
                <div className="text-white/80">{product.returns || '30 días'}</div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4" />
              {product.category}
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="text-slate-900 dark:text-white mb-4">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-slate-600 dark:text-slate-400">(248 reseñas)</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="text-slate-600 dark:text-slate-400">Precio especial</div>
                {product.price > 999 && (
                  <div className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                    <Zap className="w-3 h-3" />
                    -20% OFF
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-4 mb-2">
                <div className="text-5xl text-slate-900 dark:text-white flex items-start">
                  <span className="text-2xl mt-2">$</span>
                  {product.price}
                </div>
                {product.price > 999 && (
                  <div className="text-xl text-slate-500 dark:text-slate-400 line-through">${(product.price * 1.2).toFixed(2)}</div>
                )}
              </div>
              {product.price > 999 && (
                <div className="text-green-600 dark:text-green-400">
                  Ahorras ${(product.price * 0.2).toFixed(2)} en esta compra
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Disponibilidad:</span>
                  <span className="text-green-600 dark:text-green-400">{product.stock} unidades</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-slate-900 dark:text-white mb-3">Descripción</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features List */}
            <div>
              <h4 className="text-slate-900 dark:text-white mb-3">Caractersticas destacadas</h4>
              <div className="space-y-2">
                {(product.features && product.features.length > 0 ? product.features : [
                  'Producto 100% original y certificado',
                  'Envío gratis en compras superiores a $100',
                  'Garantía extendida de 2 años',
                  'Soporte técnico especializado 24/7',
                  'Devolución fácil en 30 días'
                ]).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <h4 className="text-slate-900 dark:text-white mb-3">Cantidad</h4>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  -
                </button>
                <div className="w-20 h-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center text-slate-900 dark:text-white">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>
              <button
                onClick={handleShare}
                className="w-14 h-14 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
              >
                <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-slate-900 dark:text-white mb-8">Productos relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <button
                  key={relatedProduct.id}
                  onClick={() => setProduct(relatedProduct)}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-xl transition-all group text-left"
                >
                  <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-50 dark:bg-slate-700/50">
                    <ImageWithFallback
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-40 object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {relatedProduct.name}
                  </div>
                  <div className="text-indigo-600 dark:text-indigo-400">
                    ${relatedProduct.price}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}