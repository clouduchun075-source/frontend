import React, { useState } from 'react';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Product } from '../data/api';
import { getDiscountedPrice } from '../utils/pricing';

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'scroll' | 'popular' | 'popular-large';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'grid' }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist, addToCart, formatPrice, t } = useCart();
  const isWishlisted = isInWishlist(product.id);
  const [added, setAdded] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: getDiscountedPrice(product.price, product.discount),
      quantity: 1,
      size: product.size[0] || 'M',
      color: product.subtitle,
      image: product.image,
      subtitle: `${product.subtitle} / SIZE ${product.size[0] || 'M'}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isSoldOut = product.stock === 0;

  // Resolve dynamic product texts from translation dictionary
  const localizedName = t(`prod_${product.id}_name` as any) !== `prod_${product.id}_name`
    ? t(`prod_${product.id}_name` as any)
    : product.name;

  const localizedSubtitle = t(`prod_${product.id}_subtitle` as any) !== `prod_${product.id}_subtitle`
    ? t(`prod_${product.id}_subtitle` as any)
    : product.subtitle;

  // Dynamically translate tags coming from database/mock API
  const getBadgeTranslation = (tag: string | null): string => {
    if (!tag) return '';
    const tagUpper = tag.toUpperCase().replace(' ', '_');
    switch (tagUpper) {
      case 'NEW_ARRIVAL': 
        return t('new_arrival_badge');
      case 'LIMITED_EDITION': 
        return t('limited_edition_badge');
      case 'POPULAR': 
        return t('popular_badge');
      case 'LIMITED': 
        return t('limited_badge');
      default: 
        return tag;
    }
  };

  // Determine wrapper classes and image aspect ratio based on variant
  let wrapperClass = "group flex flex-col space-y-1.5 md:space-y-2.5 cursor-pointer text-black dark:text-white";
  let imageAspect = "aspect-[3/4]";

  if (variant === 'scroll') {
    wrapperClass = "group flex flex-col space-y-1.5 md:space-y-2 min-w-[240px] max-w-[240px] flex-shrink-0 cursor-pointer text-black dark:text-white";
  } else if (variant === 'popular') {
    wrapperClass = "group flex flex-col space-y-1.5 md:space-y-2 cursor-pointer text-black dark:text-white w-full";
    imageAspect = "aspect-square md:aspect-[3/4]";
  } else if (variant === 'popular-large') {
    wrapperClass = "group flex flex-col space-y-1.5 md:space-y-2.5 cursor-pointer text-black dark:text-white w-full col-span-5";
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className={`${wrapperClass} border border-neutral-200 dark:border-neutral-800 rounded-[4px] p-1 md:p-2 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-[box-shadow,border-color] duration-300`}
    >
      {/* Product Image Container */}
      <div className={`overflow-hidden rounded-[3px] bg-neutral-50 dark:bg-neutral-950 relative ${imageAspect} transition-colors duration-300`}>
        
        {/* Status Badges (Top-Left) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1.5 items-start">
          {/* Discount Badge */}
          {product.discount && !isSoldOut && (
            <span className="bg-red-600 text-white text-[8px] md:text-[9px] font-black tracking-widest uppercase px-2 py-0.5 md:px-2.5 md:py-1">
              -{product.discount}% {t('sale_badge')}
            </span>
          )}
          
          {/* Out of Stock Badge */}
          {isSoldOut && (
            <span className="bg-neutral-400 dark:bg-neutral-700 text-white text-[8px] md:text-[9px] font-black tracking-widest uppercase px-2 py-0.5 md:px-2.5 md:py-1">
              {t('sold_out_badge')}
            </span>
          )}

          {/* Original Product Tag if no other badges or alongside them */}
          {product.tag && !product.discount && !isSoldOut && (
            <span className="bg-black dark:bg-white text-white dark:text-black text-[8px] md:text-[9px] font-black tracking-widest uppercase px-2 py-0.5 md:px-2.5 md:py-1">
              {getBadgeTranslation(product.tag)}
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon (Top-Right) */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-20 p-1.5 bg-white/70 dark:bg-black/60 backdrop-blur-sm rounded-full text-black dark:text-white hover:scale-105 active:scale-95 transition-all focus:outline-none border border-white/20"
          aria-label={isWishlisted ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
        >
          <Heart 
            className={`w-3.5 h-3.5 stroke-[1.5] transition-colors ${
              isWishlisted 
                ? 'fill-red-600 stroke-red-600' 
                : 'stroke-neutral-800 dark:stroke-neutral-200'
            }`} 
          />
        </button>

        {/* Product Image */}
        <img 
          src={product.image} 
          alt={localizedName} 
          className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105" 
          loading="lazy"
        />

        {/* Hover Quick Action Overlay (Bottom) */}
        {!isSoldOut && (
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center">
            <button
              onClick={handleAddToCartClick}
              className={`group/btn w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[8px] md:text-[10px] font-black tracking-[0.15em] uppercase shadow-lg hover:shadow-2xl active:scale-[0.96] transition-all duration-200 focus:outline-none ring-1 ring-black/5 dark:ring-white/10 ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t('added').toUpperCase()}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:-rotate-6 group-hover/btn:scale-110" />
                  <span className="hidden md:inline">{t('add_to_cart').toUpperCase()}</span>
                  <span className="md:hidden">{t('add_to_cart_short').toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Details Section */}
      <div className="flex flex-col space-y-1">
        {/* Category (for horizontal scroll view) */}
        {variant === 'scroll' && (
          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-left">
            {t(product.category.toLowerCase() as any)}
          </span>
        )}

        {/* Name / Title -- clamped to 2 lines with a fixed height so price
            rows line up across cards regardless of how long each name is */}
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-100 leading-tight text-left line-clamp-2 min-h-[2.5em]">
          {localizedName}
        </h3>

        {/* Subtitle / Colorway -- fixed height too, so it lines up even when empty */}
        {variant !== 'scroll' && (
          <span className="text-[10px] md:text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold tracking-wider uppercase leading-none text-left min-h-[1em] block">
            {localizedSubtitle}
          </span>
        )}

        {/* Price (always last, on its own row) */}
        <span className="text-sm font-extrabold text-neutral-850 dark:text-neutral-200 text-left">
          {product.discount ? (
            <span className="flex items-baseline gap-1.5 flex-wrap">
              <span>{formatPrice(getDiscountedPrice(product.price, product.discount))}</span>
              <span className="text-[10px] font-semibold text-neutral-400 line-through">{formatPrice(product.price)}</span>
            </span>
          ) : (
            formatPrice(product.price)
          )}
        </span>
      </div>
    </div>
  );
};
