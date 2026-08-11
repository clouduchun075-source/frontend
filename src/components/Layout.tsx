import { useState, useEffect, useRef } from 'react';
import { Menu, Search, ShoppingBag, User, X, Instagram, Send, Sun, Moon, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cartCount, wishlist, lang, setLang, currency, setCurrency, t } = useCart();
  const isAdminPage = location.pathname === '/admin';

  // Dark Mode state & persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Dropdown states for Top Bar
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  // Refs for outside click handling
  const langRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: 'NEW ARRIVALS', key: 'new_arrivals' as const, path: '/' },
    { name: 'COLLECTIONS', key: 'collections' as const, path: '/collections' },
    { name: 'LOOKBOOK', key: 'lookbook' as const, path: '/#lookbook' },
    { name: 'ABOUT', key: 'about' as const, path: '/#about' },
  ];

  const isActive = (path: string) => {
    if (path.startsWith('/#')) {
      return location.hash === path.substring(1);
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 text-black dark:text-neutral-100 antialiased font-sans select-none transition-colors duration-300">
      
      {/* 1. TOP BAR (Localization & Currency Switchers) */}
      {!isAdminPage && (
        <div className="w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 border-b border-neutral-100 dark:border-neutral-900 py-2.5 px-4 sm:px-6 lg:px-8 flex justify-end items-center text-[10px] tracking-widest uppercase font-semibold transition-colors duration-300 relative z-[60]">
          
          <div className="flex items-center space-x-6">
            {/* Language Selector */}
            <div className="relative" ref={langRef}>
              <button 
                onClick={() => { setIsLangOpen(!isLangOpen); setIsCurrencyOpen(false); }}
                className="hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors duration-150 focus:outline-none cursor-pointer"
              >
                <span>{lang}</span>
                <span className="text-[7px] opacity-60">▼</span>
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg z-50 flex flex-col py-1 transition-all">
                  {(['EN', 'RU', 'UZ'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setIsLangOpen(false);
                      }}
                      className={`text-[10px] px-3 py-2 font-bold tracking-wider hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors w-full text-left cursor-pointer ${
                        lang === l ? 'text-black dark:text-white font-black' : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative" ref={currencyRef}>
              <button 
                onClick={() => { setIsCurrencyOpen(!isCurrencyOpen); setIsLangOpen(false); }}
                className="hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors duration-150 focus:outline-none cursor-pointer"
              >
                <span>{currency}</span>
                <span className="text-[7px] opacity-60">▼</span>
              </button>
              {isCurrencyOpen && (
                <div className="absolute right-0 mt-2 w-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg z-50 flex flex-col py-1 transition-all">
                  {(['USD', 'UZS'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setIsCurrencyOpen(false);
                      }}
                      className={`text-[10px] px-3 py-2 font-bold tracking-wider hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors w-full text-left cursor-pointer ${
                        currency === c ? 'text-black dark:text-white font-black' : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={`sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/85 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 transition-colors duration-300 ${isAdminPage ? 'lg:hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-black dark:text-white hover:opacity-75 transition-opacity"
            aria-label="Menyuni ochish"
          >
            <Menu className="w-6 h-6 stroke-[1.5]" />
          </button>

          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Link to="/" className="text-2xl md:text-3xl font-black tracking-tight text-black dark:text-white hover:opacity-90 transition-opacity">
              SAYWAY
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8 lg:space-x-12">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-xs lg:text-sm font-semibold tracking-wider transition-colors relative py-2 ${
                    active 
                      ? 'text-black dark:text-white font-bold' 
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {t(item.key).toUpperCase()}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white transition-all" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-1 md:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-black dark:text-white hover:opacity-70 transition-opacity focus:outline-none"
              aria-label="Rejimni almashtirish"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 stroke-[1.5]" />
              ) : (
                <Moon className="w-5 h-5 stroke-[1.5]" />
              )}
            </button>

            {/* Wishlist Link */}
            <Link 
              to="/profile?tab=wishlist" 
              className="p-2 text-black dark:text-white hover:opacity-70 transition-opacity relative" 
              aria-label="Sevimlilar"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 bg-black dark:bg-white text-white dark:text-black text-[8px] font-extrabold rounded-full flex items-center justify-center px-0.5">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/search" className="hidden md:flex p-2 text-black dark:text-white hover:opacity-70 transition-opacity" aria-label="Qidiruv">
              <Search className="w-5 h-5 stroke-[1.5]" />
            </Link>

            <Link to="/profile" className="hidden md:flex p-2 text-black dark:text-white hover:opacity-70 transition-opacity" aria-label="Profil">
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>

            <Link to="/bag" className="p-2 text-black dark:text-white hover:opacity-70 transition-opacity relative" aria-label="Savat">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 bg-black dark:bg-white text-white dark:text-black text-[8px] font-extrabold rounded-full flex items-center justify-center px-0.5">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="md:hidden w-full bg-neutral-50 dark:bg-neutral-950 border-t border-b border-neutral-100 dark:border-neutral-900 py-1.5 overflow-hidden transition-colors">
          <div className="text-[10px] tracking-[0.25em] uppercase text-neutral-500 dark:text-neutral-400 text-center font-medium animate-pulse">
            Sayway — Hashamatli moda
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="relative w-4/5 max-w-sm bg-white dark:bg-neutral-950 h-full shadow-2xl flex flex-col p-6 transition-transform duration-300 ease-out">
            <div className="flex items-center justify-between pb-6 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xl font-black tracking-tight text-black dark:text-white">SAYWAY</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-black dark:text-white hover:opacity-70"
                aria-label="Menyuni yopish"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-6 mt-8">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-semibold tracking-widest border-b border-transparent pb-1 self-start ${
                      active ? 'text-black dark:text-white border-black dark:border-white font-bold' : 'text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {t(item.key).toUpperCase()}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
              <div className="text-xs text-neutral-400 dark:text-neutral-500">
                Premium keng o'lchamli streetwear
              </div>
              <div className="flex space-x-4 text-black dark:text-white">
                <a href="#instagram" className="hover:opacity-70"><Instagram className="w-5 h-5" /></a>
                <a href="#telegram" className="hover:opacity-70"><Send className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-grow pb-16 md:pb-0 bg-white dark:bg-neutral-900 transition-colors duration-300">
        {children}
      </main>

      {/* FOOTER */}
      <footer className={`hidden md:block bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900 py-16 px-8 mt-auto transition-colors duration-300 ${isAdminPage ? 'lg:hidden' : ''}`}>
        <div className="max-w-7xl mx-auto flex flex-col space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col space-y-4 text-black dark:text-white">
              <span className="text-2xl font-black tracking-tight">SAYWAY</span>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">KUTGANINGIZDAN YUQORI</p>
              <div className="flex items-center space-x-2 pt-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                <Send className="w-4 h-4" />
                <a href="#telegram-bot">Telegram Bot - tez orada</a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-wider text-black dark:text-white uppercase mb-4">Xizmatlar</h4>
              <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <li><a href="#shipping" className="hover:text-black dark:hover:text-white transition-colors">YETKAZIB BERISH VA QAYTARISH</a></li>
                <li><a href="#contact" className="hover:text-black dark:hover:text-white transition-colors">BIZ BILAN BOG'LANISH</a></li>
                <li><a href="#sizeguide" className="hover:text-black dark:hover:text-white transition-colors">O'LCHAM QO'LLANMASI</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-wider text-black dark:text-white uppercase mb-4">Huquqiy</h4>
              <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <li><a href="#privacy" className="hover:text-black dark:hover:text-white transition-colors">MAXFIYLIK SIYOSATI</a></li>
                <li><a href="#terms" className="hover:text-black dark:hover:text-white transition-colors">XIZMAT SHARTLARI</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-wider text-black dark:text-white uppercase mb-4">Ijtimoiy tarmoqlar</h4>
              <ul className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <li><a href="#instagram" className="hover:text-black dark:hover:text-white transition-colors">INSTAGRAM</a></li>
                <li><a href="#pinterest" className="hover:text-black dark:hover:text-white transition-colors">PINTEREST</a></li>
                <li><a href="#twitter" className="hover:text-black dark:hover:text-white transition-colors">TWITTER</a></li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-neutral-100 dark:border-neutral-900 text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold tracking-wider">
            <span>&copy; 2026 SAYWAY LUXURY. BARCHA HUQUQLAR HIMOYALANGAN.</span>
            <span className="cursor-pointer hover:text-black dark:hover:text-white transition-colors">
              GLOBAL | {lang === 'EN' ? 'ENGLISH' : lang === 'RU' ? 'РУССКИЙ' : 'O\'ZBEKCHA'}
            </span>
          </div>
        </div>
      </footer>

      {/* MOBILE BOTTOM TAB BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-around z-40 px-2 shadow-sm transition-colors duration-300">
        <Link 
          to="/collections" 
          className={`flex flex-col items-center space-y-1 p-2 ${
            location.pathname === '/collections' ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span className="text-[9px] uppercase font-bold tracking-wider">Do'kon</span>
        </Link>
        
        <Link 
          to="/search" 
          className={`flex flex-col items-center space-y-1 p-2 ${
            location.pathname === '/search' ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <Search className="w-5 h-5 stroke-[1.5]" />
          <span className="text-[9px] uppercase font-bold tracking-wider">Qidiruv</span>
        </Link>
        
        <Link 
          to="/bag" 
          className={`flex flex-col items-center space-y-1 p-2 relative ${
            location.pathname === '/bag' ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 right-1 min-w-[15px] h-3.5 bg-black dark:bg-white text-white dark:text-black text-[8px] font-extrabold rounded-full flex items-center justify-center px-0.5">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
          <span className="text-[9px] uppercase font-bold tracking-wider">Savat</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center space-y-1 p-2 ${
            location.pathname === '/profile' ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          <User className="w-5 h-5 stroke-[1.5]" />
          <span className="text-[9px] uppercase font-bold tracking-wider">Profil</span>
        </Link>
      </div>
    </div>
  );
};
