import { ArrowRight, Sparkles, ShoppingBag, Zap, Laptop, Smartphone, Headphones, Keyboard, Tablet, Gamepad2 } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface HeroProps {
  onExplore: () => void;
}

export function Hero({ onExplore }: HeroProps) {
  return (
    <>
      {/* Main Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900/20 dark:to-purple-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border border-indigo-200 dark:border-indigo-700 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-indigo-700 dark:text-indigo-300">Nuevos productos cada semana</span>
              </div>

              <div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl text-slate-900 dark:text-white mb-6 leading-tight">
                  La mejor tecnología{' '}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                      al mejor precio
                    </span>
                    <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                      <path d="M0 6C50 3 150 3 200 6" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed max-w-xl">
                  Descubre innovación en cada detalle. Productos premium seleccionados especialmente para ti.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={onExplore}
                  className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center gap-2 transform hover:scale-105"
                >
                  Explorar productos
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={onExplore}
                  className="group bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl hover:shadow-xl transition-all flex items-center gap-2"
                >
                  Ver ofertas
                  <Zap className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t-2 border-slate-200 dark:border-slate-700">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    50+
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Productos</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-1">
                    10k+
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Clientes</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                    4.9/5
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">Rating</div>
                </div>
              </div>
            </div>

            {/* Right - Product Showcase */}
            <div className="relative">
              {/* Main Product Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mix-blend-overlay"></div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800"
                  alt="Premium Technology"
                  className="w-full h-[500px] object-cover"
                />
                
                {/* Floating Badge */}
                <div className="absolute top-6 right-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-900 dark:text-white">En stock</span>
                  </div>
                </div>
              </div>

              {/* Floating Product Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 backdrop-blur-sm transform hover:scale-110 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-slate-900 dark:text-white">Envío Express</div>
                    <div className="text-slate-500 dark:text-slate-400">24-48 horas</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-2xl transform hover:scale-110 transition-transform">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-white" />
                  <div className="text-white">
                    <div>Envío 24h</div>
                    <div className="opacity-80">Gratis &gt;$100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-2">Envío Express</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Recibe tus productos en 24-48 horas. Envío gratis en compras superiores a $100
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-2">Garantía Premium</h3>
              <p className="text-slate-600 dark:text-slate-400">
                2 años de garantía en todos los productos. Soporte técnico especializado
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-900/20 dark:hover:to-rose-900/20 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-2">Calidad Garantizada</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Solo productos originales y certificados. Satisfacción garantizada al 100%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-slate-900 dark:text-white mb-4 text-[36px] font-bold font-normal">
              Explora por Categoría
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Encuentra exactamente lo que necesitas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { 
                name: 'Laptops', 
                icon: Laptop, 
                gradient: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-slate-800/50 dark:bg-slate-700/50',
                borderColor: 'border-blue-500/20',
                hoverBorder: 'hover:border-blue-500',
                info: '15+ modelos'
              },
              { 
                name: 'Smartphones', 
                icon: Smartphone, 
                gradient: 'from-purple-500 to-pink-500',
                bgColor: 'bg-slate-800/50 dark:bg-slate-700/50',
                borderColor: 'border-purple-500/20',
                hoverBorder: 'hover:border-purple-500',
                info: '20+ modelos'
              },
              { 
                name: 'Audio', 
                icon: Headphones, 
                gradient: 'from-green-500 to-emerald-500',
                bgColor: 'bg-slate-800/50 dark:bg-slate-700/50',
                borderColor: 'border-green-500/20',
                hoverBorder: 'hover:border-green-500',
                info: '10+ modelos'
              },
              { 
                name: 'Accesorios', 
                icon: Keyboard, 
                gradient: 'from-orange-500 to-amber-500',
                bgColor: 'bg-slate-800/50 dark:bg-slate-700/50',
                borderColor: 'border-orange-500/20',
                hoverBorder: 'hover:border-orange-500',
                info: '25+ productos'
              },
              { 
                name: 'Tablets', 
                icon: Tablet, 
                gradient: 'from-indigo-500 to-blue-500',
                bgColor: 'bg-slate-800/50 dark:bg-slate-700/50',
                borderColor: 'border-indigo-500/20',
                hoverBorder: 'hover:border-indigo-500',
                info: '8+ modelos'
              },
              { 
                name: 'Gaming', 
                icon: Gamepad2, 
                gradient: 'from-pink-500 to-rose-500',
                bgColor: 'bg-slate-800/50 dark:bg-slate-700/50',
                borderColor: 'border-pink-500/20',
                hoverBorder: 'hover:border-pink-500',
                info: '12+ productos'
              }
            ].map((category, index) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={index}
                  onClick={onExplore}
                  className={`group p-6 ${category.bgColor} rounded-2xl border ${category.borderColor} ${category.hoverBorder} hover:scale-105 transition-all backdrop-blur-sm`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-2xl transition-shadow`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-slate-900 dark:text-white mb-1">{category.name}</div>
                  <div className="text-slate-500 dark:text-slate-400">{category.info}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}