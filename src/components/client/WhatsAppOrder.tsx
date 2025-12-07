import { useState } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { ordersApi, settingsApi } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface WhatsAppOrderProps {
  onBack: () => void;
}

export function WhatsAppOrder({ onBack }: WhatsAppOrderProps) {
  const { items, total, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryMethod: 'Domicilio'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      // Create order in database
      const orderData = {
        items,
        customerName: formData.name,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        deliveryMethod: formData.deliveryMethod
      };

      const response = await ordersApi.create(orderData);
      
      // Get WhatsApp number from settings
      let whatsappNumber = '573001234567';
      try {
        const settingsData = await settingsApi.get();
        if (settingsData.settings?.whatsappNumber) {
          whatsappNumber = settingsData.settings.whatsappNumber;
        }
      } catch (error) {
        console.log('Using default WhatsApp number');
      }

      // Format WhatsApp message
      let message = `🛍️ *NUEVO PEDIDO - TechStore*\n\n`;
      message += `📋 *ID Pedido:* ${response.order.id}\n`;
      message += `👤 *Cliente:* ${formData.name}\n`;
      message += `📱 *Teléfono:* ${formData.phone}\n`;
      message += `🚚 *Entrega:* ${formData.deliveryMethod}\n`;
      if (formData.address) {
        message += `📍 *Dirección:* ${formData.address}\n`;
      }
      message += `\n*PRODUCTOS:*\n`;
      
      items.forEach((item, index) => {
        message += `\n${index + 1}. *${item.product.name}*\n`;
        message += `   • Cantidad: ${item.quantity}\n`;
        message += `   • Precio unitario: $${item.product.price}\n`;
        message += `   • Subtotal: $${(item.product.price * item.quantity).toFixed(2)}\n`;
      });
      
      message += `\n💰 *TOTAL: $${total.toFixed(2)}*\n`;
      message += `\n✅ Pedido registrado exitosamente`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Clear cart and show success
      clearCart();
      toast.success('¡Pedido enviado! Revisa WhatsApp para confirmar');
      
      setTimeout(() => {
        onBack();
      }, 1500);

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Error al crear el pedido. Intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
          </button>
          <div>
            <h1 className="text-slate-900 dark:text-white">Finalizar pedido</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Completa tus datos para enviar el pedido
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-slate-900 dark:text-white mb-4">Resumen del pedido</h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.product.id} className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900 dark:text-white">{item.product.name}</div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {item.quantity} × ${item.product.price}
                  </div>
                </div>
                <div className="text-slate-900 dark:text-white">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-slate-900 dark:text-white">Total</span>
            <span className="text-slate-900 dark:text-white">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Customer Info Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-2">
              Teléfono de contacto *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
              placeholder="+57 300 123 4567"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-2">
              Dirección de entrega
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
              placeholder="Calle 123, Barrio X"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-2">
              Método de entrega *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, deliveryMethod: 'Domicilio' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.deliveryMethod === 'Domicilio'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-2">🏠</div>
                <div className="text-slate-900 dark:text-white">Domicilio</div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, deliveryMethod: 'Recoger en tienda' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.deliveryMethod === 'Recoger en tienda'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-2">🏪</div>
                <div className="text-slate-900 dark:text-white">Recoger en tienda</div>
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Enviando...' : 'Enviar pedido por WhatsApp'}
          </button>

          <p className="text-slate-500 dark:text-slate-400 text-center">
            Al enviar el pedido, serás redirigido a WhatsApp para completar la compra
          </p>
        </div>
      </div>
    </div>
  );
}