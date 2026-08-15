import { useState } from 'react';
import { Minus, Plus, Send, Globe, Lock, ShoppingBag, X, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckoutModal } from '../components/CheckoutModal';
import type { ShippingAddress } from '../data/api';

export const Bag = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartSubtotal, cartCount, updateQuantity, removeFromCart, createOrder, formatPrice, t } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'SAYWAY10') {
      setIsPromoApplied(true);
      setPromoError('');
    } else if (promoCode.trim() === '') {
      setPromoError('Promo kodni kiriting.');
    } else {
      setPromoError('Promo kod noto\'g\'ri. 10% chegirma uchun SAYWAY10 dan foydalaning.');
    }
  };

  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/bag' } });
      return;
    }
    setShowCheckoutModal(true);
  };

  const handlePlaceOrder = async (shipping: ShippingAddress) => {
    setPlacingOrder(true);
    const order = await createOrder(shipping);
    setPlacingOrder(false);
    setShowCheckoutModal(false);
    if (order) {
      setShowCheckoutSuccess(true);
      setTimeout(() => {
        setShowCheckoutSuccess(false);
        navigate('/order-confirmation');
      }, 1500);
    }
  };

  const deliveryFee = 0.00;
  const discount = isPromoApplied ? cartSubtotal * 0.1 : 0;
  const orderTotal = cartSubtotal + deliveryFee - discount;

  return (
    <div className="bg-white dark:bg-neutral-900 text-black dark:text-white min-h-screen py-6 md:py-16 transition-colors duration-300">
      
      {showCheckoutSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-5 px-8 tracking-widest flex items-center space-x-3 shadow-2xl animate-slide-in">
          <Check className="w-5 h-5 text-green-600 dark:text-green-700 stroke-[3]" />
          <span>Buyurtmangiz qabul qilinmoqda...</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-6 mb-8 md:mb-12">
          <h1 className="text-2xl md:text-5xl font-black uppercase text-black dark:text-white tracking-tight">
            Savatingiz
          </h1>
          <p className="hidden md:block text-xs text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest mt-1">
            {cartCount} {cartCount === 1 ? 'MAHSULOT' : 'MAHSULOT'} — SIFATNI TANLANG
          </p>
          <p className="md:hidden text-xs text-neutral-550 dark:text-neutral-400 font-medium tracking-wide mt-1">
            To'plamingizda {cartCount} ta mahsulot
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-6 bg-white dark:bg-neutral-900 transition-colors">
            <div className="w-16 h-16 rounded-full bg-neutral-50 dark:bg-neutral-805 flex items-center justify-center border border-neutral-100 dark:border-neutral-800">
              <ShoppingBag className="w-6 h-6 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Savatingiz bo'sh</h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Premium mahsulotlarni qo'shib, savatingizni to'ldiring.</p>
            </div>
            <Link
              to="/collections"
              className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase px-8 py-3.5 tracking-widest hover:opacity-85"
            >
              Kolleksiyalarni ko'rish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            
            <div className="col-span-1 lg:col-span-7 space-y-8">
              
              {/* DESKTOP Cart List */}
              <div className="hidden md:block space-y-6">
                {cartItems.map((item) => (
                  <div 
                    key={`${item.id}-${item.size}`} 
                    className="flex space-x-6 pb-6 border-b border-neutral-100 dark:border-neutral-800 items-start relative group"
                  >
                    <Link to={`/product/${item.id}`} className="w-32 aspect-square overflow-hidden bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-800 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" />
                    </Link>

                    <div className="flex-grow flex justify-between items-stretch py-1">
                      <div className="flex flex-col space-y-1.5 text-left">
                        <h3 className="text-sm font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-100 leading-tight">
                          {t(`prod_${item.id}_name` as any) !== `prod_${item.id}_name` ? t(`prod_${item.id}_name` as any) : item.name}
                        </h3>
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                          {t(`prod_${item.id}_subtitle` as any) !== `prod_${item.id}_subtitle` ? t(`prod_${item.id}_subtitle` as any) : item.color} / O'LCHAM {item.size}
                        </span>
                        <span className="text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider">
                          MAHSULOT ID: {item.itemId}
                        </span>

                        <div className="flex items-center border border-neutral-200 dark:border-neutral-750 w-28 justify-between mt-4 bg-white dark:bg-neutral-800">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors focus:outline-none"
                            aria-label="Kamaytirish"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-black dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors focus:outline-none"
                            aria-label="Ko'paytirish"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end h-full">
                        <button
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="text-neutral-400 hover:text-black dark:hover:text-white p-1 focus:outline-none"
                          aria-label="O'chirish"
                        >
                          <X className="w-4 h-4 stroke-[1.5]" />
                        </button>
                        <span className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-auto">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* MOBILE Cart List */}
              <div className="md:hidden space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={`${item.id}-${item.size}`} 
                    className="bg-neutral-50 dark:bg-neutral-950 p-4 flex gap-4 border border-neutral-100 dark:border-neutral-850 relative"
                  >
                    <Link to={`/product/${item.id}`} className="w-20 h-20 overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" />
                    </Link>

                    <div className="flex-grow flex flex-col justify-between py-0.5">
                      <div className="space-y-1 pr-6 text-left">
                        <h3 className="text-[11px] font-black text-neutral-850 dark:text-neutral-200 tracking-wide uppercase leading-tight">
                          {t(`prod_${item.id}_name` as any) !== `prod_${item.id}_name` ? t(`prod_${item.id}_name` as any) : item.name}
                        </h3>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold block uppercase">
                          {t(`prod_${item.id}_subtitle` as any) !== `prod_${item.id}_subtitle` ? t(`prod_${item.id}_subtitle` as any) : item.color} / O'lcham: {item.size}
                        </span>
                      </div>

                      <div className="flex justify-between items-end mt-3">
                        <div className="flex items-center border border-neutral-200 dark:border-neutral-750 rounded-full w-24 justify-between bg-white dark:bg-neutral-800 px-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="p-1 text-neutral-500 dark:text-neutral-450 hover:text-black dark:hover:text-white focus:outline-none"
                            aria-label="Kamaytirish"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-bold text-black dark:text-white">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="p-1 text-neutral-500 dark:text-neutral-450 hover:text-black dark:hover:text-white focus:outline-none"
                            aria-label="Ko'paytirish"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      className="absolute top-4 right-4 text-neutral-400 hover:text-black dark:hover:text-white p-1 focus:outline-none"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo Code Box (Mobile) */}
              <div className="md:hidden bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 p-4">
                <form onSubmit={handleApplyPromo} className="flex justify-between items-center w-full">
                  <input
                    type="text"
                    placeholder="Promo kod"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                    disabled={isPromoApplied}
                    className="bg-transparent text-xs text-black dark:text-white tracking-widest outline-none flex-grow placeholder:text-neutral-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isPromoApplied}
                    className="text-[10px] font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200 hover:opacity-70 disabled:opacity-50 focus:outline-none"
                  >
                    {isPromoApplied ? 'QO\'LLANDI' : 'QO\'LLASH'}
                  </button>
                </form>
                {isPromoApplied && (
                  <span className="text-[8px] text-green-600 dark:text-green-400 font-bold tracking-wider mt-1 block">10% chegirma qo'llanildi.</span>
                )}
                {promoError && (
                  <span className="text-[8px] text-red-500 dark:text-red-400 font-bold tracking-wider mt-1 block">{promoError}</span>
                )}
              </div>

              {/* Telegram Gateway Checkout Banner (Mobile) */}
              <div className="md:hidden border border-neutral-150 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50 dark:bg-neutral-950 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <Send className="w-4 h-4 stroke-[2] rotate-45 -translate-x-0.5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black uppercase text-neutral-800 dark:text-neutral-200 tracking-wider">
                    Telegram orqali to'lov
                  </h3>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-normal font-semibold">
                    Telegram orqali bir bosishda xarid qilish tez orada.
                  </p>
                </div>
              </div>

              {/* Telegram Gateway Checkout Banner (Desktop) */}
              <div className="hidden md:flex border border-neutral-200 dark:border-neutral-800 p-8 bg-neutral-50 dark:bg-neutral-950 flex-col justify-between space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-black dark:text-white border border-neutral-150 dark:border-neutral-800">
                    <Send className="w-4 h-4 stroke-[1.5] rotate-45 -translate-x-0.5" />
                  </div>
                  <span className="bg-black dark:bg-white text-white dark:text-black text-[8px] font-black tracking-widest uppercase px-2.5 py-1">
                    TEZ ORADA
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase text-black dark:text-white tracking-wider">
                    Telegram orqali kelajakdagi to'lov
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide leading-relaxed">
                    Xaridlaringizni bizning xavfsiz Telegram tizimimiz orqali osongina yakunlang. Ishga tushirilgandan so'ng, siz shaxsiy yordam bilan tranzaksiyalarni yakunlash uchun noyob <span className="font-bold text-black dark:text-white">**SAYPAID Buyurtma ID</span>si olasiz.
                  </p>
                </div>

                <div className="flex space-x-3 pt-2">
                  <span className="border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-405 bg-white dark:bg-neutral-900 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5">
                    Tezkor yangilanishlar
                  </span>
                  <span className="border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-405 bg-white dark:bg-neutral-900 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5">
                    Shaxsiy yordam
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Summary Card */}
            <div className="col-span-1 lg:col-span-5 space-y-6">
              
              <div className="border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 bg-white dark:bg-neutral-950 flex flex-col space-y-5">
                <h2 className="text-[10px] font-black tracking-widest uppercase text-neutral-400 dark:text-neutral-500 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  Buyurtma xulosasi
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-450 tracking-wide">
                    <span>Jami narx</span>
                    <span className="font-bold text-black dark:text-white">{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-455 tracking-wide">
                    <span>Yetkazib berish</span>
                    <span className="hidden md:inline font-bold text-black dark:text-white">{formatPrice(deliveryFee)}</span>
                    <span className="md:hidden font-bold text-neutral-800 dark:text-neutral-200">Bepul</span>
                  </div>
                  {isPromoApplied && (
                    <div className="flex justify-between text-xs font-semibold text-green-600 dark:text-green-400 tracking-wide">
                      <span>Promo chegirma (10%)</span>
                      <span className="font-bold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5 flex justify-between items-baseline">
                  <span className="text-xs font-bold tracking-wider uppercase text-black dark:text-white">Jami</span>
                  <span className="text-xl md:text-3xl font-black text-black dark:text-white">
                    {formatPrice(orderTotal)}
                  </span>
                </div>

                {/* Promo Code Input (Desktop) */}
                <form onSubmit={handleApplyPromo} className="hidden md:block pt-2">
                  <label className="text-[9px] font-bold tracking-widest uppercase text-neutral-400 dark:text-neutral-500 block mb-2">Promo kod</label>
                  <div className="flex border border-neutral-200 dark:border-neutral-800">
                    <input
                      type="text"
                      placeholder="Kodni kiriting"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                      disabled={isPromoApplied}
                      className="bg-transparent text-xs text-black dark:text-white tracking-widest px-3 py-2.5 outline-none flex-grow placeholder:text-neutral-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isPromoApplied}
                      className="bg-neutral-105 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-widest px-4 hover:bg-neutral-200 dark:hover:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-800 disabled:opacity-50 focus:outline-none"
                    >
                      QO'LLASH
                    </button>
                  </div>
                  {promoError && (
                    <span className="text-[9px] text-red-500 dark:text-red-400 font-bold tracking-wider mt-1 block">{promoError}</span>
                  )}
                  {isPromoApplied && (
                    <span className="text-[9px] text-green-600 dark:text-green-400 font-bold tracking-wider mt-1 block">10% chegirma muvaffaqiyatli qo'llanildi!</span>
                  )}
                </form>

                {user ? (
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-4.5 tracking-widest hover:opacity-90 transition-opacity rounded-full focus:outline-none"
                  >
                    To'lovga o'tish
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/signup', { state: { from: '/bag' } })}
                    className="w-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-4.5 tracking-widest hover:opacity-90 transition-opacity rounded-full focus:outline-none"
                  >
                    To'lov qilish uchun ro'yxatdan o'tish
                  </button>
                )}

                <div className="md:hidden text-center text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider">
                  SSL bilan himoyalangan xavfsiz to'lov
                </div>
              </div>

              <div className="hidden md:grid grid-cols-2 gap-4">
                <div className="border border-neutral-200 dark:border-neutral-800 p-4 text-center bg-white dark:bg-neutral-900 flex flex-col items-center justify-center space-y-2 transition-colors">
                  <Globe className="w-4 h-4 text-neutral-400 dark:text-neutral-550 stroke-[1.5]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Xalqaro yetkazib berish</span>
                </div>
                <div className="border border-neutral-200 dark:border-neutral-800 p-4 text-center bg-white dark:bg-neutral-900 flex flex-col items-center justify-center space-y-2 transition-colors">
                  <Lock className="w-4 h-4 text-neutral-400 dark:text-neutral-555 stroke-[1.5]" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Xavfsiz kirish</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {showCheckoutModal && (
        <CheckoutModal
          total={formatPrice(orderTotal)}
          submitting={placingOrder}
          onClose={() => setShowCheckoutModal(false)}
          onSubmit={handlePlaceOrder}
        />
      )}
    </div>
  );
};
