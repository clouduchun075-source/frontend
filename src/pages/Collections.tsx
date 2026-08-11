import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Check, ArrowLeft, ArrowRight, X, ArrowUpDown, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../data/api';
import type { Product } from '../data/api';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { getAllCategories, getAllBrands, getAllColors } from '../utils/productTaxonomy';

// Only the original 3 categories have translation strings; anything an
// admin adds later via "+ Add" is shown as typed instead of translated.
const CATEGORY_TRANSLATION_KEYS: Record<string, 'outerwear' | 'knitwear' | 'accessories'> = {
  Outerwear: 'outerwear',
  Knitwear: 'knitwear',
  Accessories: 'accessories',
};

const ITEMS_PER_PAGE = 6;

export const Collections = () => {
  const navigate = useNavigate();
  const { formatPrice, t } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setAllProducts);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [priceLimit, setPriceLimit] = useState(2500);
  const [priceLimitTouched, setPriceLimitTouched] = useState(false);
  // No brand pre-selected -- previously this defaulted to only
  // 'SAYWAY BLACK LABEL', which silently hid every 'SAYWAY CORE' product
  // the moment the page loaded and made the filters look broken.
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sortBy, setSortBy] = useState('Newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // The price slider's max used to be hardcoded to 2500, so any product
  // priced above that could never be shown no matter what the customer
  // picked. Size it to the priciest product actually in the catalog instead.
  const priceCap = useMemo(() => {
    if (allProducts.length === 0) return 2500;
    const highest = Math.max(...allProducts.map((p) => p.price));
    return Math.max(100, Math.ceil(highest / 100) * 100);
  }, [allProducts]);

  useEffect(() => {
    if (!priceLimitTouched) setPriceLimit(priceCap);
  }, [priceCap, priceLimitTouched]);

  // Category/brand/color option lists come from the same shared list the
  // Admin panel writes to (see utils/productTaxonomy.ts) -- so a custom
  // option an admin adds while creating a product shows up as a real filter
  // choice here too, instead of only ever being a hidden, unfilterable value.
  const categoriesList: { name: string; count: number; translationKey?: 'all_products' | 'outerwear' | 'knitwear' | 'accessories' }[] = [
    { name: 'All Products', count: allProducts.length, translationKey: 'all_products' },
    ...getAllCategories().map((name) => ({
      name,
      count: allProducts.filter((p) => p.category === name).length,
      translationKey: CATEGORY_TRANSLATION_KEYS[name],
    })),
  ];

  const categoryLabel = (cat: { name: string; translationKey?: 'all_products' | 'outerwear' | 'knitwear' | 'accessories' }) =>
    cat.translationKey ? t(cat.translationKey) : cat.name;

  const colorsList = getAllColors();
  const brandsList = getAllBrands();
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Products');
    setPriceLimit(priceCap);
    setPriceLimitTouched(false);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSize('');
    setCurrentPage(1);
  };

  const getSortTranslationKey = (opt: string) => {
    switch (opt) {
      case 'Newest': return 'sort_newest';
      case 'Price: Low-High': return 'sort_price_low_high';
      case 'Price: High-Low': return 'sort_price_high_low';
      default: return opt;
    }
  };

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter((prod) => {
      if (searchQuery && !prod.name.toLowerCase().includes(searchQuery.toLowerCase()) && !prod.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'All Products' && prod.category !== selectedCategory) {
        return false;
      }
      if (prod.price > priceLimit) {
        return false;
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(prod.brand)) {
        return false;
      }
      if (selectedColors.length > 0 && !selectedColors.includes(prod.color)) {
        return false;
      }
      if (selectedSize && !prod.size.includes(selectedSize)) {
        return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'Price: Low-High':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'Price: High-Low':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, priceLimit, selectedBrands, selectedColors, selectedSize, sortBy, allProducts]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderSidebarContent = () => (
    <div className="flex flex-col space-y-10 text-black dark:text-white">
      <div className="relative">
        <input
          type="text"
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white border border-neutral-100 dark:border-neutral-800 placeholder:text-neutral-400 text-xs px-4 py-3 pr-10 focus:outline-none focus:border-neutral-350 dark:focus:border-neutral-600 font-medium transition-colors"
        />
        <Search className="absolute right-3 top-3 w-4 h-4 text-neutral-400 stroke-[1.5]" />
      </div>

      <div>
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-5 text-left">{t('categories_title')}</h4>
        <ul className="space-y-3.5">
          {categoriesList.map((cat) => (
            <li key={cat.name}>
              <button
                onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
                className={`w-full flex justify-between items-center text-xs tracking-wide font-semibold text-left transition-colors cursor-pointer ${
                  selectedCategory === cat.name ? 'text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>{categoryLabel(cat)}</span>
                <span className="text-neutral-400 dark:text-neutral-500 font-normal">({cat.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-5 text-left">{t('price_range')}</h4>
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max={priceCap}
            step="50"
            value={priceLimit}
            onChange={(e) => { setPriceLimit(Number(e.target.value)); setPriceLimitTouched(true); setCurrentPage(1); }}
            className="w-full h-[3px] bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-black dark:accent-white focus:outline-none"
          />
          <div className="flex justify-between text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider">
            <span>{formatPrice(0)}</span>
            <span>{formatPrice(priceLimit)}+</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-5 text-left">{t('brand')}</h4>
        <div className="space-y-3">
          {brandsList.map((brand) => {
            const checked = selectedBrands.includes(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => { handleBrandToggle(brand); setCurrentPage(1); }}
                className="w-full flex items-center space-x-3 text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer text-left"
              >
                <div className={`w-4 h-4 flex-shrink-0 border border-neutral-300 dark:border-neutral-700 rounded-none bg-white dark:bg-neutral-800 flex items-center justify-center transition-all ${
                  checked ? 'bg-black border-black dark:bg-white dark:border-white' : 'hover:border-neutral-400'
                }`}>
                  {checked && <Check className="w-3 h-3 text-white dark:text-black stroke-[3.5]" />}
                </div>
                <span className="tracking-wide">{brand}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-5 text-left">{t('color')}</h4>
        <div className="flex space-x-3">
          {colorsList.map((color) => {
            const active = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => handleColorToggle(color.name)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative cursor-pointer ${
                  color.name === 'white' ? 'border border-neutral-200 dark:border-neutral-800' : ''
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              >
                {active && (
                  <Check className={`w-3.5 h-3.5 stroke-[3] ${
                    color.name === 'white' ? 'text-black' : 'text-white'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 mb-5 text-left">{t('size')}</h4>
        <div className="grid grid-cols-3 gap-2">
          {sizesList.map((size) => {
            const active = selectedSize === size;
            return (
              <button
                key={size}
                onClick={() => { setSelectedSize(active ? '' : size); setCurrentPage(1); }}
                className={`border text-[10px] font-bold uppercase py-2 tracking-widest text-center transition-all cursor-pointer ${
                  active 
                    ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' 
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-750 text-neutral-850 dark:text-neutral-205 hover:border-neutral-400 dark:hover:border-neutral-550'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {(searchQuery || selectedCategory !== 'All Products' || priceLimitTouched || selectedBrands.length > 0 || selectedColors.length > 0 || selectedSize) && (
        <button
          onClick={handleResetFilters}
          className="text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white border-b border-transparent hover:border-black dark:hover:border-white transition-all py-1.5 self-start cursor-pointer"
        >
          {t('clear_filters')}
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 bg-white dark:bg-neutral-900 transition-colors duration-300">
      
      {/* DESKTOP LAYOUT */}
      <div className="hidden md:block">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-1 text-left">
            <nav className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center space-x-1.5">
              <span className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => navigate('/')}>{t('home')}</span>
              <span>&gt;</span>
              <span className="text-black dark:text-white">{t('collections')}</span>
            </nav>
            <h1 className="text-3xl font-black uppercase text-black dark:text-white tracking-tight pt-1">
              {t('all_collections')}
            </h1>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 tracking-wide font-medium">
              {t('curated_seasonal_essentials')}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="flex items-center space-x-3 border border-neutral-200 dark:border-neutral-750 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
            >
              <span>{t('sort_by').toUpperCase()}: {t(getSortTranslationKey(sortBy) as any).toUpperCase()}</span>
              <ChevronDown className="w-4 h-4 text-neutral-500 stroke-[1.5]" />
            </button>

            {isSortDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsSortDropdownOpen(false)} />
                <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg z-45 flex flex-col py-1.5">
                  {['Newest', 'Price: Low-High', 'Price: High-Low'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setIsSortDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className="text-left text-xs px-4 py-2 font-medium tracking-wide text-neutral-550 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      {t(getSortTranslationKey(opt) as any)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <aside className="col-span-3 sticky top-28 self-start max-h-[85vh] overflow-y-auto pr-4 scrollbar-hide bg-white dark:bg-neutral-900 transition-colors">
            {renderSidebarContent()}
          </aside>

          <section className="col-span-9 flex flex-col space-y-12">
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-3 gap-y-10 gap-x-6">
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                <span className="text-sm font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{t('no_items_match')}</span>
                <button onClick={handleResetFilters} className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase px-6 py-3 tracking-widest hover:opacity-85 cursor-pointer">
                  {t('clear_filters')}
                </button>
              </div>
            )}

            {filteredProducts.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 border-t border-neutral-100 dark:border-neutral-800 pt-8 mt-4">
                <button 
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer ${
                      currentPage === page ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-neutral-550 hover:text-black dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            )}

            {filteredProducts.length > 0 && totalPages <= 1 && (
              <div className="flex items-center justify-center border-t border-neutral-100 dark:border-neutral-800 pt-8 mt-4">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest">
                  {t('showing_products')
                    .replace('{count}', filteredProducts.length.toString())
                    .replace('{total}', filteredProducts.length.toString())}
                </span>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="md:hidden space-y-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-black dark:text-white text-center">
            {t('all_collections')}
          </h1>
        </div>

        <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-hide">
          {categoriesList.map((cat) => {
            const active = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
                className={`text-[11px] font-extrabold px-5 py-2.5 rounded-full transition-all uppercase tracking-widest flex-shrink-0 border cursor-pointer ${
                  active 
                    ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' 
                    : 'bg-neutral-55 dark:bg-neutral-800 border-neutral-150 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {categoryLabel(cat)}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-b border-neutral-100 dark:border-neutral-800 py-3">
          <button 
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-355 py-1 border-r border-neutral-100 dark:border-neutral-800 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>{t('sort_by')}</span>
          </button>
          
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-355 py-1 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>{t('filter')}</span>
          </button>
        </div>

        {isSortDropdownOpen && (
          <div className="bg-neutral-50 dark:bg-neutral-950 p-4 border border-neutral-100 dark:border-neutral-800 flex flex-col space-y-3 animate-fade-in">
            {['Newest', 'Price: Low-High', 'Price: High-Low'].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSortBy(opt);
                  setIsSortDropdownOpen(false);
                  setCurrentPage(1);
                }}
                className={`text-left text-xs font-bold uppercase tracking-widest cursor-pointer ${
                  sortBy === opt ? 'text-black dark:text-white' : 'text-neutral-400'
                }`}
              >
                {t(getSortTranslationKey(opt) as any)}
              </button>
            ))}
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">{t('no_items_match')}</span>
            <button onClick={handleResetFilters} className="border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-black dark:text-white cursor-pointer">
              {t('clear_filters')}
            </button>
          </div>
        )}
      </div>

      {/* MOBILE SIDEBAR FILTER DRAWER */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="relative w-[85%] max-w-sm bg-white dark:bg-neutral-950 h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 mb-6">
              <span className="text-sm font-black tracking-widest uppercase text-black dark:text-white">{t('filter_options')}</span>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-black dark:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-grow pb-10">{renderSidebarContent()}</div>
            <div className="sticky bottom-0 bg-white dark:bg-neutral-950 pt-4 border-t border-neutral-100 dark:border-neutral-850">
              <button
                onClick={() => { setIsMobileFiltersOpen(false); setCurrentPage(1); }}
                className="w-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-4 tracking-widest hover:opacity-90 cursor-pointer"
              >
                {t('apply_filters')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
