import { useState } from 'react';
import { PublicNavbar } from './public/PublicNavbar';
import { Hero } from './public/Hero';
import { ProductCatalog } from './client/ProductCatalog';
import { ProductDetail } from './client/ProductDetail';
import { Cart } from './client/Cart';
import { FloatingCart } from './client/FloatingCart';
import { ClientFooter } from './client/ClientFooter';
import { useAuth } from '../contexts/AuthContext';

interface PublicLayoutProps {
  onSwitchToAdmin?: () => void;
  onLoginRequired: () => void;
}

export function PublicLayout({ onSwitchToAdmin, onLoginRequired }: PublicLayoutProps) {
  const { user } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = () => {
    setShowCart(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <PublicNavbar 
        onSwitchToAdmin={onSwitchToAdmin}
        onLoginRequired={onLoginRequired}
      />
      <main>
        {selectedProductId ? (
          <ProductDetail
            productId={selectedProductId}
            onBack={handleBackToCatalog}
            onLoginRequired={onLoginRequired}
          />
        ) : (
          <>
            {!user && <Hero onExplore={() => {
              const element = document.getElementById('catalog');
              element?.scrollIntoView({ behavior: 'smooth' });
            }} />}
            <div id="catalog" className={user ? 'pt-20' : ''}>
              <ProductCatalog 
                onLoginRequired={onLoginRequired}
                onProductClick={handleProductClick}
              />
            </div>
          </>
        )}
      </main>
      
      {/* Floating Cart Button */}
      <FloatingCart onCheckout={handleCheckout} />
      
      {/* Cart Modal */}
      {showCart && <Cart onLoginRequired={onLoginRequired} onClose={() => setShowCart(false)} />}
      
      {!selectedProductId && <ClientFooter />}
    </div>
  );
}