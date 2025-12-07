import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingCartProps {
  onCheckout: () => void;
}

export function FloatingCart({ onCheckout }: FloatingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeFromCart, updateQuantity, total, itemCount } = useCart();

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-indigo-500/50 hover:scale-110 transition-all"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm animate-pulse">
            {itemCount}
          </div>
        )}
      </button>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 z-50 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between">
                <div className="text-white">
                  <h2 className="text-2xl">Tu carrito</h2>
                  <p className="text-white/80">{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Tu carrito está vacío</p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <motion.div
                      key={item.product.id + index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex gap-4"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-slate-900 dark:text-white line-clamp-2 mb-2">
                          {item.product.name}
                        </h3>
                        <div className="text-indigo-600 dark:text-indigo-400 mb-3">
                          ${item.product.price.toFixed(2)}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.product.id, item.quantity - 1);
                                } else {
                                  removeFromCart(item.product.id);
                                }
                              }}
                              className="w-8 h-8 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                            >
                              {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                            </button>
                            <span className="w-8 text-center text-slate-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                if (item.quantity < item.product.stock) {
                                  updateQuantity(item.product.id, item.quantity + 1);
                                }
                              }}
                              disabled={item.quantity >= item.product.stock}
                              className="w-8 h-8 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-slate-900 dark:text-white">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-6 space-y-4">
                  <div className="flex items-center justify-between text-xl">
                    <span className="text-slate-900 dark:text-white">Total:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onCheckout();
                    }}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all"
                  >
                    Proceder al checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}