import { useState, useMemo, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { getProducts } from '../data/api';
import type { Product } from '../data/api';
import { ProductCard } from '../components/ProductCard';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setAllProducts);
  }, []);

  const categories = ['All', 'Outerwear', 'Knitwear', 'Accessories'];

  const filteredProducts = useMemo(() => {
    let results = allProducts;
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') {
      results = results.filter((p) => p.category === selectedCategory);
    }
    return results;
  }, [query, selectedCategory, allProducts]);

  const trendingSearches = ['Hoodie', 'Coat', 'Leather', 'Knitwear', 'Oversize'];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-black dark:text-white pb-20 md:pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Search Input */}
        <div className="mb-6 md:mb-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search collections, products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-750 placeholder:text-neutral-400 text-sm md:text-base px-5 py-4 pr-20 focus:outline-none focus:border-black dark:focus:border-white font-medium tracking-wide transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button onClick={() => setQuery('')} className="p-1 text-neutral-400 hover:text-black dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
              <SearchIcon className="w-5 h-5 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Desktop: Category pills */}
        <div className="hidden md:flex items-center gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 border transition-all focus:outline-none ${
                selectedCategory === cat
                  ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black'
                  : 'bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-750 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile: Filter toggle */}
        <div className="md:hidden flex items-center gap-3 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border flex-shrink-0 transition-all focus:outline-none ${
                selectedCategory === cat
                  ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black'
                  : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-150 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trending searches (shown when no query) */}
        {!query && (
          <div className="mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
              Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-750 px-4 py-2 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors focus:outline-none"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-black dark:text-white">
            {query ? `Results for "${query}"` : 'All Products'}
          </h2>
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Results Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} variant="grid" />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 bg-white dark:bg-neutral-900 transition-colors">
            <div className="w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center border border-neutral-100 dark:border-neutral-800">
              <SearchIcon className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">No results found</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Try a different search term or category.</p>
            </div>
            <button
              onClick={() => { setQuery(''); setSelectedCategory('All'); }}
              className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase px-6 py-3 tracking-widest hover:opacity-90 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
