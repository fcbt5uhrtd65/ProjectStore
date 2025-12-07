import { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const [whatsappNumber, setWhatsappNumber] = useState('573001234567');
  const [storeName, setStoreName] = useState('TechStore');
  const [storeEmail, setStoreEmail] = useState('contacto@techstore.com');
  const [storeAddress, setStoreAddress] = useState('Bogotá, Colombia');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se guardaría en localStorage o backend
    localStorage.setItem('settings', JSON.stringify({
      whatsappNumber,
      storeName,
      storeEmail,
      storeAddress
    }));
    toast.success('Configuración guardada correctamente');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-slate-900 dark:text-white mb-2">Configuración</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Administra la configuración de tu tienda
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* WhatsApp */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-slate-900 dark:text-white mb-4">WhatsApp Business</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
                placeholder="573001234567"
              />
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Los pedidos se enviarán a este número. Formato: código de país + número (sin espacios ni símbolos)
              </p>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-slate-900 dark:text-white mb-4">Información de la tienda</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2">
                Nombre de la tienda
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2">
                Email de contacto
              </label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
