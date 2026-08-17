import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../data/api';
import type { Product } from '../data/api';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export const Home = () => {
  const { t } = useCart();
  const [desktopEmail, setDesktopEmail] = useState('');
  const [mobileEmail, setMobileEmail] = useState('');
  const [desktopSubscribed, setDesktopSubscribed] = useState(false);
  const [mobileSubscribed, setMobileSubscribed] = useState(false);
  const [apiProducts, setApiProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setApiProducts);
  }, []);

  const desktopNewArrivals = apiProducts.filter(p => p.tag === 'NEW ARRIVAL').slice(0, 4);
  const desktopMostPopularRight = apiProducts.slice(4, 8);
  const mobileNewArrivals = apiProducts.filter(p => p.tag === 'NEW ARRIVAL').slice(0, 2);
  const mobileMostPopular = apiProducts.slice(0, 4);
  
  const heroPopularProduct = apiProducts.find(p => p.id === 'c12') || apiProducts[0];

  const desktopCategories = [
    { key: 'men' as const, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400' },
    { key: 'women' as const, image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=400' },
    { key: 'kids' as const, image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=400' },
    { key: 'bags' as const, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400' },
    { key: 'street' as const, image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=400' },
    { key: 'exclusives' as const, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400' },
    { key: 'sport' as const, image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400' },
  ];

  const mobileCategories = [
    { key: 'men' as const, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200' },
    { key: 'women' as const, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { key: 'kids' as const, image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=200' },
    { key: 'access_short' as const, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=200' },
  ];

  const handleDesktopSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (desktopEmail.trim()) {
      setDesktopSubscribed(true);
      setDesktopEmail('');
      setTimeout(() => setDesktopSubscribed(false), 3000);
    }
  };

  const handleMobileSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileEmail.trim()) {
      setMobileSubscribed(true);
      setMobileEmail('');
      setTimeout(() => setMobileSubscribed(false), 3000);
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-900 transition-colors duration-300">
      {/* HERO SECTION */}
      <section className="relative h-[58vh] md:h-[90vh] bg-neutral-950 overflow-hidden">
        <div className="absolute inset-0 bg-neutral-950">
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200" 
            alt="Hero Streetwear Background" 
            className="w-full h-full object-cover object-top grayscale opacity-75 md:opacity-85 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-6 pb-[105px] md:pb-28 max-w-4xl mx-auto z-10">
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-extrabold tracking-tight text-white mb-4 uppercase leading-none">
            {t('hero_title_line1')}<br />{t('hero_title_line2')}
          </h1>
          
          <p className="hidden md:block text-neutral-300 text-sm tracking-wide max-w-xl mb-8 leading-relaxed font-medium">
            {t('hero_subtitle')}
          </p>

          <Link
            to="/collections"
            className="bg-white text-black font-bold uppercase text-xs md:text-sm px-8 md:px-10 py-3.5 md:py-4 tracking-widest hover:bg-neutral-100 transition-all duration-200 cursor-pointer"
          >
            <span className="hidden md:inline">{t('explore_collection')}</span>
            <span className="md:hidden">{t('shop_collection')}</span>
          </Link>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="md:hidden py-8 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors">
        <div className="flex overflow-x-auto gap-6 px-6 scrollbar-hide">
          {mobileCategories.map((cat) => (
            <Link key={cat.key} to="/collections" className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-neutral-100 dark:border-neutral-800">
                <img src={cat.image} alt={t(cat.key)} className="w-full h-full object-cover grayscale" />
              </div>
              <span className="text-xs font-semibold tracking-wider text-neutral-800 dark:text-neutral-200">{t(cat.key)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="hidden md:block py-12 px-8 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-7 gap-4">
            {desktopCategories.map((cat) => (
              <Link 
                key={cat.key} 
                to="/collections" 
                className="group relative h-40 overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 cursor-pointer"
              >
                <img 
                  src={cat.image} 
                  alt={t(cat.key)} 
                  className="w-full h-full object-cover grayscale transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-xs font-bold tracking-widest uppercase">{t(cat.key)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS SECTION */}
      <section className="py-12 md:py-20 px-4 sm:px-8 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div className="text-left">
              <h2 className="text-xl md:text-3xl font-black tracking-tight uppercase text-black dark:text-white">{t('new_arrivals')}</h2>
              <p className="hidden md:block text-neutral-400 dark:text-neutral-500 text-xs tracking-wider uppercase font-medium mt-1">
                {t('latest_weekly_drops')}
              </p>
            </div>
            <Link to="/collections" className="text-xs md:text-sm font-bold tracking-wider uppercase border-b-2 border-black dark:border-white pb-1 text-black dark:text-white hover:opacity-75 transition-opacity cursor-pointer">
              {t('view_all')}
            </Link>
          </div>

          {/* Desktop Arrivals Grid */}
          <div className="hidden md:grid grid-cols-4 gap-6">
            {desktopNewArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} variant="grid" />
            ))}
          </div>

          {/* Mobile Arrivals Horizontal Scroll */}
          <div className="md:hidden flex overflow-x-auto gap-3 scrollbar-hide">
            {mobileNewArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} variant="scroll" />
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL LOOKBOOK SECTION */}
      <section className="hidden md:block py-20 px-8 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-12 items-center">
          <div className="relative group border border-neutral-200 dark:border-neutral-800 overflow-hidden aspect-[1.1] bg-neutral-100 dark:bg-neutral-900">
            <img 
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=800" 
              alt="Editorial Photoshoot" 
              className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-102"
            />
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[85%] bg-white/70 dark:bg-black/70 backdrop-blur-md border border-white/20 h-14 flex items-center justify-around rounded-full px-4 shadow-xl z-20">
              <span className="flex flex-col items-center text-black/60 dark:text-white/60"><span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mb-1" /></span>
              <span className="flex flex-col items-center text-black/40 dark:text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40 mb-1" /></span>
              <span className="flex flex-col items-center text-black/40 dark:text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40 mb-1" /></span>
              <span className="flex flex-col items-center text-black/40 dark:text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-black/40 dark:bg-white/40 mb-1" /></span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-6 max-w-lg text-left">
            <span className="text-xs font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">{t('editorial_series')}</span>
            <h2 className="text-4xl lg:text-5xl font-black uppercase text-black dark:text-white tracking-tight leading-[1.1]">
              {t('oversize_understated')}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-450 text-sm tracking-wide leading-relaxed font-medium">
              {t('editorial_desc')}
            </p>
            <Link 
              to="/collections" 
              className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest uppercase border-b-2 border-black dark:border-white pb-1 text-black dark:text-white hover:opacity-75 transition-opacity self-start cursor-pointer"
            >
              <span>{t('view_lookbook')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="md:hidden relative h-[80vh] bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=600" 
            alt="Editorial Mobile" 
            className="w-full h-full object-cover grayscale opacity-70"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 pb-16 text-center items-center z-10 space-y-6">
          <h2 className="text-3xl font-extrabold uppercase text-white tracking-tight leading-none">
            {t('oversize_understated')}
          </h2>
          <p className="text-neutral-200 text-xs tracking-wider max-w-sm leading-relaxed">
            {t('editorial_mobile_desc')}
          </p>
          <Link 
            to="/collections" 
            className="border border-white bg-transparent text-white font-bold uppercase text-xs px-6 py-3 tracking-widest hover:bg-white hover:text-black transition-colors cursor-pointer"
          >
            {t('read_editorial')}
          </Link>
        </div>
      </section>

      {/* MOST POPULAR SECTION */}
      <section className="py-12 md:py-20 px-4 sm:px-8 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12 text-left">
            <h2 className="text-xl md:text-3xl font-black tracking-tight uppercase text-black dark:text-white">
              {t('most_popular')}
            </h2>
          </div>

          <div className="hidden md:grid grid-cols-12 gap-8">
            {/* Left Hero Popular Product Card */}
            {heroPopularProduct && (
              <div className="col-span-5 flex flex-col space-y-4">
                <ProductCard product={heroPopularProduct} variant="popular" />
              </div>
            )}

            {/* Right List of Popular Product Cards */}
            <div className="col-span-7 grid grid-cols-2 gap-6">
              {desktopMostPopularRight.map((prod) => (
                <ProductCard key={prod.id} product={prod} variant="popular" />
              ))}
            </div>
          </div>

          {/* Mobile Most Popular Grid */}
          <div className="md:hidden grid grid-cols-2 gap-x-2.5 gap-y-3">
            {mobileMostPopular.map((prod) => (
              <ProductCard key={prod.id} product={prod} variant="popular" />
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="bg-black dark:bg-neutral-950 text-white py-16 px-8 text-center border-b border-neutral-900 transition-colors">
        <div className="max-w-xl mx-auto flex flex-col items-center space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-widest">{t('insider_title')}</h2>
          <p className="text-neutral-400 text-xs tracking-wider max-w-sm">
            {t('insider_desc')}
          </p>
          {desktopSubscribed ? (
            <div className="text-sm font-bold text-green-400 tracking-wider py-2">{t('subscribed')}</div>
          ) : (
            <form onSubmit={handleDesktopSubscribe} className="flex w-full mt-4 max-w-md border-b border-neutral-700 pb-2">
              <input 
                type="email" 
                placeholder={t('insider_placeholder')} 
                value={desktopEmail}
                onChange={(e) => setDesktopEmail(e.target.value)}
                className="bg-transparent text-white border-none outline-none flex-grow text-xs tracking-widest py-2 focus:ring-0 placeholder:text-neutral-600 focus:outline-none"
                required 
              />
              <button type="submit" className="text-xs font-bold uppercase tracking-widest text-white pl-4 hover:opacity-75 transition-opacity cursor-pointer">
                {t('subscribe')}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="md:hidden px-4 py-12 bg-white dark:bg-neutral-900 transition-colors">
        <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-none p-6 text-center flex flex-col space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">{t('insider_title')}</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs tracking-wide leading-relaxed">
            {t('insider_mobile_desc')}
          </p>
          {mobileSubscribed ? (
            <div className="text-xs font-bold text-green-600 dark:text-green-400 tracking-wider py-2">{t('subscribed')}</div>
          ) : (
            <form onSubmit={handleMobileSubscribe} className="flex flex-col space-y-3 mt-2">
              <input 
                type="email" 
                placeholder={t('email_address_placeholder')} 
                value={mobileEmail}
                onChange={(e) => setMobileEmail(e.target.value)}
                className="bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 outline-none text-xs px-4 py-3 text-center focus:border-black dark:focus:border-white placeholder:text-neutral-400"
                required 
              />
              <button 
                type="submit" 
                className="bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs py-3 tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
              >
                {t('subscribe')}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* MOBILE FOOTER */}
      <footer className="md:hidden py-12 px-6 bg-neutral-50 dark:bg-neutral-950 text-center flex flex-col items-center space-y-6 transition-colors">
        <span className="text-xl font-black tracking-tight text-black dark:text-white">SAYPAID</span>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <a href="#privacy" className="hover:text-black dark:hover:text-white">{t('privacy_policy')}</a>
          <a href="#terms" className="hover:text-black dark:hover:text-white">{t('terms_of_service')}</a>
          <a href="#telegram-support" className="hover:text-black dark:hover:text-white">{t('telegram_support')}</a>
          <a href="#shipping" className="hover:text-black dark:hover:text-white">{t('shipping')}</a>
        </div>

        <div className="text-[8px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-semibold">
          &copy; 2026 SAYPAID LUXURY. {t('all_rights_reserved')}
        </div>
      </footer>
    </div>
  );
};
