import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

export function ClientFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-slate-900 dark:text-white">TechStore</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Tu tienda de confianza para productos tecnológicos premium. Calidad, innovación y servicio excepcional.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-900 dark:text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              {['Inicio', 'Productos', 'Ofertas', 'Nuevos', 'Destacados', 'Blog'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-slate-900 dark:text-white mb-4">Servicio al Cliente</h3>
            <ul className="space-y-3">
              {[
                'Mi Cuenta',
                'Rastrear Pedido',
                'Política de Devolución',
                'Garantía',
                'Preguntas Frecuentes',
                'Soporte Técnico'
              ].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-slate-900 dark:text-white mb-4">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                <div className="text-slate-600 dark:text-slate-400">
                  Calle 123 #45-67<br />
                  Bogotá, Colombia
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <a 
                  href="tel:+573001234567" 
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  +57 300 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <a 
                  href="mailto:contacto@techstore.com" 
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  contacto@techstore.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              © {currentYear} TechStore. Todos los derechos reservados. Hecho con 
              <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-1" />
              en Colombia
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="#" 
                className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Términos y Condiciones
              </a>
              <a 
                href="#" 
                className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-600 dark:text-slate-400">
              Métodos de pago seguros
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                💳 Visa
              </div>
              <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                💳 Mastercard
              </div>
              <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                💰 PayPal
              </div>
              <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                🔒 Seguro
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
