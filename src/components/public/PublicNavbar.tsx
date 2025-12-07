import { useState } from 'react';
import { ShoppingBag, ShoppingCart, Menu, X, Sun, Moon, LogOut, Shield, LogIn } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface PublicNavbarProps {
  onSwitchToAdmin?: () => void;
  onLoginRequired: () => void;
}

export function PublicNavbar({ onSwitchToAdmin, onLoginRequired }: PublicNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl text-slate-900 dark:text-white">TechStore</span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-slate-600 dark:text-slate-400">
                  Hola, {user.name}
                </span>
                
                {isAdmin && onSwitchToAdmin && (
                  <button
                    onClick={onSwitchToAdmin}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    Panel Admin
                  </button>
                )}

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Salir
                </button>
              </>
            ) : (
              <button
                onClick={onLoginRequired}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <LogIn className="w-5 h-5" />
                Iniciar sesión
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Sun className="w-5 h-5 text-slate-300" />
              )}
            </button>

            <button
              onClick={() => {
                const event = new Event('openCart');
                window.dispatchEvent(event);
              }}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-slate-900 dark:text-white" />
            ) : (
              <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">
                  Hola, {user.name}
                </div>
                
                {isAdmin && onSwitchToAdmin && (
                  <button
                    onClick={() => {
                      onSwitchToAdmin();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    Panel Admin
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onLoginRequired();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Iniciar sesión
              </button>
            )}

            <button
              onClick={() => {
                const event = new Event('openCart');
                window.dispatchEvent(event);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Carrito
              </div>
              {itemCount > 0 && (
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 w-full px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-5 h-5" />
                  Modo oscuro
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5" />
                  Modo claro
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
