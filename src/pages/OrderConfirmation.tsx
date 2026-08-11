import { useEffect } from 'react';
import { Check, Package, ArrowRight, Copy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const STATUS_LABELS: Record<string, string> = {
  SHIPPED: 'YUBORILDI',
  PROCESSING: 'QAYTA ISHLANMOQDA',
  PENDING: 'KUTILMOQDA',
  CANCELLED: 'BEKOR QILINDI',
  DELIVERED: 'YETKAZILDI',
};

export const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { lastOrder } = useCart();

  useEffect(() => {
    if (!lastOrder) {
      navigate('/');
    }
  }, [lastOrder, navigate]);

  if (!lastOrder) return null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(lastOrder.orderId);
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border border-green-200">
            <Check className="w-10 h-10 text-green-600 stroke-[2.5]" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Buyurtma tasdiqlandi</h1>
          <p className="text-sm text-neutral-500 font-medium tracking-wide">
            Xaridingiz uchun tashakkur. Buyurtmangiz muvaffaqiyatli qabul qilindi.
          </p>
        </div>

        {/* Order ID */}
        <div className="bg-neutral-50 border border-neutral-200 p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">Buyurtma ID</span>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl font-black text-black tracking-tight">{lastOrder.orderId}</span>
              <button onClick={copyOrderId} className="p-1.5 hover:bg-neutral-200 rounded transition-colors" title="Buyurtma ID nusxalash">
                <Copy className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">Holati</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                {STATUS_LABELS[lastOrder.status] || lastOrder.status}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">Jami</span>
              <span className="text-sm font-black text-black">
                ${lastOrder.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {lastOrder.items && lastOrder.items.length > 0 && (
          <div className="bg-white border border-neutral-200 p-4 space-y-3 text-left">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">Buyurtma qilingan mahsulotlar</span>
            {lastOrder.items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center space-x-3 py-2 border-b border-neutral-50 last:border-0">
                <div className="w-12 h-12 overflow-hidden bg-neutral-50 border border-neutral-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-[10px] font-bold text-black uppercase tracking-wide truncate">{item.name}</h4>
                  <span className="text-[9px] text-neutral-400 font-semibold">Soni: {item.quantity} / O'lcham: {item.size}</span>
                </div>
                <span className="text-xs font-bold text-black flex-shrink-0">
                  ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="flex items-start space-x-3 bg-blue-50 border border-blue-100 p-4 text-left">
          <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-800 block">Keyin nima bo'ladi?</span>
            <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
              Tez orada email orqali tasdiqlashni olasiz. Buyurtmangiz 2-3 ish kuni ichida qayta ishlanadi va yetkaziladi. Buyurtma holatini profilingizda kuzatishingiz mumkin.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/profile"
            className="flex-1 bg-black text-white text-xs font-bold uppercase py-4 tracking-widest text-center hover:opacity-90 transition-opacity"
          >
            Buyurtmalarimni ko'rish
          </Link>
          <Link
            to="/collections"
            className="flex-1 border border-neutral-200 text-neutral-700 text-xs font-bold uppercase py-4 tracking-widest text-center hover:border-neutral-400 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Xaridni davom ettirish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
