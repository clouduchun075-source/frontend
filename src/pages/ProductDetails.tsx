import { useState, useEffect } from 'react';
import { Heart, HelpCircle, Star, ArrowLeft, Check, Plus, Minus, ShieldCheck, Truck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductById } from '../data/api';
import type { Product } from '../data/api';
import { ProductCard } from '../components/ProductCard';
import { getDiscountedPrice } from '../utils/pricing';

export const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, isInWishlist, formatPrice, t } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getProductById(id).then((p) => {
      if (cancelled) return;
      setProduct(p || null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const relatedIds = ['c10', 'c5', 'c7', 'c6'];
    let cancelled = false;
    Promise.all(relatedIds.map((rid) => getProductById(rid))).then((results) => {
      if (cancelled) return;
      setRelatedProducts(results.filter((p): p is Product => !!p));
    });
    return () => { cancelled = true; };
  }, []);
  
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center transition-colors">
        <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center transition-colors">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-black uppercase tracking-widest text-black dark:text-white">Product Not Found</h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/collections')}
            className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase px-6 py-3 tracking-widest hover:opacity-90"
          >
            Back to Collections
          </button>
        </div>
      </div>
    );
  }

  const images: string[] = product.images && product.images.length > 0 ? product.images : [product.image];
  const sizes = product.size || ['S', 'M', 'L'];
  const inWishlist = isInWishlist(product.id);

  // Resolve dynamic product texts from translation dictionary
  const localizedName = t(`prod_${product.id}_name` as any) !== `prod_${product.id}_name`
    ? t(`prod_${product.id}_name` as any)
    : product.name;

  const localizedSubtitle = t(`prod_${product.id}_subtitle` as any) !== `prod_${product.id}_subtitle`
    ? t(`prod_${product.id}_subtitle` as any)
    : product.subtitle;

  const localizedDesc = t(`prod_${product.id}_desc` as any) !== `prod_${product.id}_desc`
    ? t(`prod_${product.id}_desc` as any)
    : (product.description || 'Crafted from premium materials with architectural precision.');

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: localizedName,
      price: getDiscountedPrice(product.price, product.discount),
      quantity,
      size: selectedSize,
      color: localizedSubtitle,
      image: product.image,
      subtitle: `${localizedSubtitle} / SIZE ${selectedSize}`,
    });
    
    setToastMessage('Added to Bag successfully');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const desktopReviews = [
    {
      author: 'Alexander K.',
      verified: true,
      rating: 5,
      comment: '"The weight of this piece is incredible. It feels substantial without being bulky. The oversized fit is perfectly calculated."',
      img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=150',
    },
    {
      author: 'Sophia M.',
      verified: true,
      rating: 5,
      comment: '"Beautiful construction. The premium materials are noticeable from the first touch. Best investment piece this season."',
      img: null,
    },
    {
      author: 'James L.',
      verified: true,
      rating: 5,
      comment: '"Finally found a piece that actually holds its shape after washing. The double-layered construction is a game changer."',
      img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=150',
    },
  ];

  const mobileReviews = [
    {
      author: 'Marcus T.',
      verified: true,
      rating: 5,
      comment: '"The silhouette is exactly what I\'ve been looking for. It has that architectural stiffness that keeps its shape even after washing. Truly premium."',
    },
    {
      author: 'Elena S.',
      verified: true,
      rating: 5,
      comment: '"Sizing is very oversized. I\'m usually an M but ordered an S and it\'s perfect. The weight of the fabric is incredible for winter."',
    },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 text-black dark:text-white min-h-screen relative pb-20 md:pb-12 transition-colors duration-300">
      
      {showToast && (
        <div className="fixed top-20 right-4 md:right-8 z-50 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-4 px-6 tracking-widest flex items-center space-x-3 shadow-2xl animate-slide-in">
          <Check className="w-4 h-4 text-green-600 dark:text-green-700 stroke-[3.5]" />
          <span>{toastMessage || 'Added to Bag successfully'}</span>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)} />
          <div className="relative bg-white dark:bg-neutral-950 p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl border border-neutral-100 dark:border-neutral-800 z-10 text-black dark:text-white">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Size Guide</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800">
                  <th className="pb-2 text-left">Size</th>
                  <th className="pb-2 text-left">Chest</th>
                  <th className="pb-2 text-left">Length</th>
                </tr>
              </thead>
              <tbody className="text-neutral-750 dark:text-neutral-350 font-medium">
                <tr className="border-b border-neutral-50 dark:border-neutral-900"><td className="py-2">XS</td><td>36"</td><td>26"</td></tr>
                <tr className="border-b border-neutral-50 dark:border-neutral-900"><td className="py-2">S</td><td>38"</td><td>27"</td></tr>
                <tr className="border-b border-neutral-50 dark:border-neutral-900"><td className="py-2">M</td><td>40"</td><td>28"</td></tr>
                <tr className="border-b border-neutral-50 dark:border-neutral-900"><td className="py-2">L</td><td>42"</td><td>29"</td></tr>
                <tr className="border-b border-neutral-50 dark:border-neutral-900"><td className="py-2">XL</td><td>44"</td><td>30"</td></tr>
                <tr><td className="py-2">XXL</td><td>46"</td><td>31"</td></tr>
              </tbody>
            </table>
            <button
              onClick={() => setShowSizeGuide(false)}
              className="mt-6 w-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase py-3 tracking-widest hover:opacity-90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        
        <div className="md:hidden flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back</span>
          </button>
        </div>

        <nav className="hidden md:flex text-[9px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 items-center space-x-1.5 mb-8">
          <span className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => navigate('/')}>Home</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => navigate('/collections')}>Collections</span>
          <span>&gt;</span>
          <span className="text-black dark:text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Image Gallery */}
          <div className="col-span-1 md:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            <div className="hidden md:flex flex-col space-y-3 w-20">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square w-20 overflow-hidden border bg-neutral-50 dark:bg-neutral-800 ${
                    activeImageIndex === idx ? 'border-black dark:border-white' : 'border-neutral-200 dark:border-neutral-750'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover grayscale" />
                </button>
              ))}
            </div>

            <div className="flex-grow aspect-[3/4] overflow-hidden bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-800 relative">
              {product.tag && (
                <span className="absolute top-4 left-4 bg-black dark:bg-white text-white dark:text-black text-[8px] font-bold tracking-widest uppercase px-2.5 py-1 z-10">
                  {product.tag}
                </span>
              )}
              <img 
                src={images[activeImageIndex]} 
                alt={localizedName} 
                className="w-full h-full object-cover grayscale" 
              />
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 md:hidden">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full border ${
                      activeImageIndex === idx ? 'bg-black border-black dark:bg-white dark:border-white' : 'bg-white/60 border-white/20'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Buy Box */}
          <div className="col-span-1 md:col-span-5 flex flex-col space-y-6 md:space-y-8">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black uppercase text-black dark:text-white tracking-tight leading-tight">
                {localizedName}
              </h1>
              <div className="flex items-baseline gap-2.5 text-xl md:text-2xl font-black text-neutral-900 dark:text-neutral-100">
                <span>{formatPrice(getDiscountedPrice(product.price, product.discount))}</span>
                {product.discount && (
                  <>
                    <span className="text-sm md:text-base font-bold text-neutral-400 line-through">{formatPrice(product.price)}</span>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-red-600">-{product.discount}%</span>
                  </>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <div className="flex text-black dark:text-white">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-black dark:fill-white stroke-black dark:stroke-white" />)}
              </div>
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider">[42]</span>
            </div>

            <div className="text-xs md:text-sm text-neutral-550 dark:text-neutral-400 font-medium tracking-wide leading-relaxed text-left">
              <p className="hidden md:block">{localizedDesc}</p>
              <p className="md:hidden">{localizedDesc}</p>
            </div>

            <div className="grid grid-cols-2 border-t border-b border-neutral-100 dark:border-neutral-800 py-5 gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Material</span>
                <span className="text-xs font-bold text-black dark:text-white tracking-wide">{product.material || 'Premium Cotton'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Weight</span>
                <span className="text-xs font-bold text-black dark:text-white tracking-wide">{product.weight || 'Standard'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Select Size</span>
                <button 
                  onClick={() => setShowSizeGuide(true)}
                  className="text-[10px] font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-widest flex items-center space-x-1 hover:opacity-75 focus:outline-none"
                >
                  <HelpCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span className="hidden md:inline">Find My Size</span>
                  <span className="md:hidden">Size Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {sizes.map((size) => {
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`border text-[10px] font-bold py-3.5 tracking-wider uppercase text-center transition-all focus:outline-none ${
                        active 
                          ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black' 
                          : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-750 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:flex flex-col space-y-3">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-800">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-black dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    className="p-2.5 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                </div>
              </div>
              <button 
                onClick={handleAddToCart}
                className="w-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-4.5 tracking-widest hover:opacity-90 transition-opacity"
              >
                Add To Cart
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`w-full border text-xs font-bold uppercase py-4.5 tracking-widest transition-colors flex items-center justify-center space-x-2 focus:outline-none ${
                  inWishlist
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-neutral-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <Heart className={`w-4 h-4 stroke-[1.5] ${inWishlist ? 'fill-white dark:fill-black' : ''}`} />
                <span>{inWishlist ? 'Added to Wishlist' : 'Add To Wishlist'}</span>
              </button>
            </div>

            <div className="hidden md:flex flex-col space-y-3 pt-2 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider">
              <div className="flex items-center space-x-2.5">
                <Truck className="w-4 h-4 text-neutral-400" />
                <span>Complimentary carbon-neutral shipping on all orders.</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-neutral-400" />
                <span>14-day premium return policy.</span>
              </div>
            </div>
          </div>
        </div>

        {/* COMPLETE THE LOOK */}
        <section className="py-12 md:py-20 border-t border-neutral-100 dark:border-neutral-800 mt-16 md:mt-24">
          <div className="flex justify-between items-baseline mb-8 md:mb-12">
            <h2 className="text-xl md:text-3xl font-black uppercase text-black dark:text-white tracking-tight">
              Complete the Look
            </h2>
          </div>

          {/* Desktop Related Cards Grid */}
          <div className="hidden md:grid grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} variant="grid" />
            ))}
          </div>

          {/* Mobile Related Cards Scroll */}
          <div className="md:hidden flex overflow-x-auto gap-5 scrollbar-hide">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} variant="scroll" />
            ))}
          </div>
        </section>

        {/* COMMUNITY FEEDBACK */}
        <section className="py-12 md:py-20 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex justify-between items-center mb-10 md:mb-12">
            <div className="space-y-1.5">
              <h2 className="text-xl md:text-3xl font-black uppercase text-black dark:text-white tracking-tight">
                Community Feedback
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex text-black dark:text-white">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-black dark:fill-white stroke-black dark:stroke-white" />)}
                </div>
                <span className="text-xs font-semibold text-neutral-550 dark:text-neutral-400 tracking-wide">4.8 / 5.0 (124 reviews)</span>
              </div>
            </div>

            <button onClick={() => showToastMessage('Review form coming soon')} className="hidden md:block bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase px-8 py-3.5 tracking-widest hover:opacity-85">
              Write A Review
            </button>
          </div>

          <div className="hidden md:grid grid-cols-3 gap-6">
            {desktopReviews.map((rev, idx) => (
              <div key={idx} className="border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col justify-between min-h-[260px] bg-white dark:bg-neutral-950 transition-colors">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold block text-neutral-850 dark:text-neutral-200">{rev.author}</span>
                      {rev.verified && (
                        <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Verified Buyer</span>
                      )}
                    </div>
                    <div className="flex text-black dark:text-white">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-black dark:fill-white stroke-black dark:stroke-white" />)}
                    </div>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs font-medium tracking-wide leading-relaxed italic">
                    {rev.comment}
                  </p>
                </div>

                {rev.img && (
                  <div className="w-10 h-10 overflow-hidden border border-neutral-200 dark:border-neutral-800 mt-4 bg-neutral-50 dark:bg-neutral-900">
                    <img src={rev.img} alt="thumbnail" className="w-full h-full object-cover grayscale" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="md:hidden flex flex-col space-y-6">
            {mobileReviews.map((rev, idx) => (
              <div key={idx} className="space-y-3 border-b border-neutral-100 dark:border-neutral-850 pb-5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{rev.author}</span>
                  <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Verified Buyer</span>
                </div>
                <div className="flex text-black dark:text-white">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-black dark:fill-white stroke-black dark:stroke-white" />)}
                </div>
                <p className="text-neutral-550 dark:text-neutral-400 text-xs leading-relaxed font-medium tracking-wide">
                  {rev.comment}
                </p>
              </div>
            ))}
            
            <button onClick={() => showToastMessage('All reviews coming soon')} className="w-full border border-neutral-200 dark:border-neutral-850 py-3.5 text-xs font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-800">
              Read All Reviews
            </button>
          </div>
        </section>
      </div>

      {/* MOBILE STICKY BOTTOM ACTIONS BAR */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 h-16 bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between px-4 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => toggleWishlist(product.id)}
          className={`border p-3.5 transition-all flex items-center justify-center focus:outline-none ${
            inWishlist 
              ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
              : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600'
          }`}
        >
          <Heart className={`w-5 h-5 stroke-[1.5] ${inWishlist ? 'fill-white dark:fill-black' : ''}`} />
        </button>
        <button 
          onClick={handleAddToCart}
          className="flex-grow bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-4.5 ml-4 tracking-widest hover:opacity-90 transition-opacity text-center flex items-center justify-center focus:outline-none"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
};
