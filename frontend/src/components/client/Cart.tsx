import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { WhatsAppOrder } from './WhatsAppOrder';
import { toast } from 'sonner';

interface CartProps {
  onLoginRequired: () => void;
  onClose?: () => void;
}

export function Cart({ onLoginRequired, onClose }: CartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart();
  const { user } = useAuth();

  // Open cart when onClose is provided (modal mode)
  useEffect(() => {
    if (onClose) {
      setIsOpen(true);
    }
  }, [onClose]);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number, maxStock: number) => {
    if (newQuantity > maxStock) {
      toast.error(`Solo hay ${maxStock} unidades disponibles`);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemove = (productName: string, productId: string) => {
    removeFromCart(productId);
    toast.success(`${productName} eliminado del carrito`);
  };

  // Listen for cart button clicks
  useEffect(() => {
    const handleCartOpen = () => {
      if (!user && itemCount === 0) {
        toast.info('Inicia sesión para agregar productos al carrito');
        onLoginRequired();
        return;
      }
      setIsOpen(true);
    };
    window.addEventListener('openCart', handleCartOpen);
    return () => window.removeEventListener('openCart', handleCartOpen);
  }, [user, itemCount, onLoginRequired]);

  if (showCheckout) {
    return <WhatsAppOrder onBack={() => setShowCheckout(false)} />;
  }

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-40 flex items-center gap-2"
      >
        <ShoppingBag className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="bg-white text-indigo-600 px-3 py-1 rounded-full">
            {itemCount}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-slate-900 dark:text-white">Carrito de compras</h2>
              <p className="text-slate-600 dark:text-slate-400">
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-900 dark:text-white" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-600 flex-shrink-0">
                        <ImageWithFallback
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-900 dark:text-white mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                          ${item.product.price}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1, item.product.stock)}
                            className="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-slate-900 dark:text-white" />
                          </button>
                          <span className="text-slate-900 dark:text-white w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1, item.product.stock)}
                            className="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-slate-900 dark:text-white" />
                          </button>
                          <button
                            onClick={() => handleRemove(item.product.name, item.product.id)}
                            className="ml-auto p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                      <span className="text-slate-900 dark:text-white">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-900 dark:text-white">Total</span>
                <span className="text-slate-900 dark:text-white">
                  ${total.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowCheckout(true);
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                📲 Enviar pedido por WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleClose}
        />
      )}
    </>
  );
}