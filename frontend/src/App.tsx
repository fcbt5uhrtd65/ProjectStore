import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoginModal } from './components/LoginModal';
import { Toaster } from 'sonner';

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Si el usuario es admin y está en vista admin, mostrar panel admin
  if (user && isAdmin && view === 'admin') {
    return <AdminLayout onSwitchToClient={() => setView('public')} />;
  }

  // Siempre mostrar el layout público (con o sin usuario logueado)
  return (
    <>
      <PublicLayout 
        onSwitchToAdmin={user && isAdmin ? () => setView('admin') : undefined}
        onLoginRequired={() => setShowLoginModal(true)}
      />
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <Toaster position="top-right" richColors />
              <AppContent />
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}