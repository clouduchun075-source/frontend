import { useState, useEffect } from 'react';
import { User, Package, Heart, Settings, LogOut, ChevronRight, Mail, Phone, MapPin, Trash2, X, Clock, MessageCircle, XCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart, ORDER_CANCEL_WINDOW_MS } from '../context/CartContext';
import type { Order } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProducts, getAddresses, deleteAddress } from '../data/api';
import type { Product, SavedAddress } from '../data/api';
import { ProductCard } from '../components/ProductCard';

// Bot/support chat customers can reach a human operator through.
const OPERATOR_TELEGRAM_URL = 'https://t.me/saywayuz_bot';

const formatCountdown = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const isOrderCancellable = (order: Order) => {
  if (order.status === 'CANCELLED' || order.status === 'SHIPPED' || order.status === 'DELIVERED') return false;
  const placedAt = order.created_at ? new Date(order.created_at).getTime() : 0;
  if (!placedAt) return false;
  return Date.now() - placedAt < ORDER_CANCEL_WINDOW_MS;
};

const orderRemainingMs = (order: Order) => {
  const placedAt = order.created_at ? new Date(order.created_at).getTime() : 0;
  if (!placedAt) return 0;
  return ORDER_CANCEL_WINDOW_MS - (Date.now() - placedAt);
};

const STATUS_LABELS: Record<Order['status'], string> = {
  SHIPPED: 'YUBORILDI',
  PROCESSING: 'QAYTA ISHLANMOQDA',
  PENDING: 'KUTILMOQDA',
  CANCELLED: 'BEKOR QILINDI',
  DELIVERED: 'YETKAZILDI',
};
const statusLabel = (status: Order['status']) => STATUS_LABELS[status] || status;

export const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, cartCount, wishlist, formatPrice, cancelOrder } = useCart();
  const { user, loading: authLoading, signOut, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'orders' | 'wishlist' | 'locations' | 'settings'>('overview');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Re-render every second while any order is still within its cancellation
  // window, so the countdown timers stay live.
  useEffect(() => {
    if (!orders.some(isOrderCancellable)) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const handleCancelOrder = async (orderId: string) => {
    setConfirmCancelId(null);
    setCancellingId(orderId);
    const ok = await cancelOrder(orderId);
    setCancellingId(null);
    if (ok) {
      setViewOrder((prev) => (prev && prev.orderId === orderId ? { ...prev, status: 'CANCELLED' } : prev));
    }
  };

  // Sync section based on tab search param or state routing
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'wishlist' || location.state?.activeTab === 'wishlist') {
      setActiveSection('wishlist');
    } else if (tab === 'orders') {
      setActiveSection('orders');
    } else if (tab === 'settings') {
      setActiveSection('settings');
    } else if (tab === 'locations') {
      setActiveSection('locations');
    } else if (tab === 'overview') {
      setActiveSection('overview');
    }
  }, [location]);

  const userInfo = {
    name: (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Mehmon',
    email: user?.email || '',
    phone: user?.phone ? `+${user.phone}` : '',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    memberSince: user?.created_at
      ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : '',
    memberTier: 'BLACK LABEL',
  };

  // Controlled inputs for the Settings form -- kept in sync with the real
  // account values so "Save Changes" has something correct to persist.
  const [nameInput, setNameInput] = useState(userInfo.name);
  const [emailInput, setEmailInput] = useState(userInfo.email);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setNameInput(userInfo.name);
    setEmailInput(userInfo.email);
  }, [user?.id, userInfo.name, userInfo.email]);

  const menuItems = [
    { id: 'overview' as const, label: 'Umumiy', icon: User },
    { id: 'orders' as const, label: 'Buyurtmalarim', icon: Package },
    { id: 'wishlist' as const, label: 'Sevimlilar', icon: Heart },
    { id: 'locations' as const, label: 'Manzillar', icon: MapPin },
    { id: 'settings' as const, label: 'Sozlamalar', icon: Settings },
  ];

  const [allProductsList, setAllProductsList] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setAllProductsList);
  }, [wishlist]); // Reload when wishlist modifications happen to sync lists

  useEffect(() => {
    if (user) getAddresses().then(setAddresses);
  }, [user?.id]);

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const wishlistProducts = allProductsList.filter((p) => wishlist.includes(p.id));

  const handleSave = async () => {
    setSaveError('');
    setSavingProfile(true);
    const { error } = await updateProfile({
      fullName: nameInput.trim(),
      // Phone-only accounts have no email yet -- only send an email update
      // if they actually typed one in.
      email: emailInput.trim() || undefined,
    });
    setSavingProfile(false);
    if (error) {
      setSaveError(error);
      setTimeout(() => setSaveError(''), 4000);
      return;
    }
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center transition-colors">
        <div className="text-xs font-bold uppercase tracking-widest text-neutral-400 animate-pulse">Yuklanmoqda...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center px-4 py-16 transition-colors">
        <div className="w-full max-w-sm text-center space-y-6">
          <User className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-lg font-black uppercase tracking-tight text-black dark:text-white">Tizimga kirish talab qilinadi</h1>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Profilingiz, buyurtmalaringiz va sevimlilarni ko'rish uchun tizimga kiring yoki hisob yarating.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-3.5 tracking-widest hover:opacity-90">
              Kirish
            </Link>
            <Link to="/signup" className="border border-neutral-200 dark:border-neutral-750 text-black dark:text-white text-xs font-bold uppercase py-3.5 tracking-widest hover:border-neutral-400">
              Hisob yaratish
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-black dark:text-white pb-20 md:pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {showSaveToast && (
          <div className="fixed top-20 right-4 md:right-8 z-50 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-4 px-6 tracking-widest flex items-center space-x-3 shadow-2xl animate-slide-in">
            <span>O'zgarishlar muvaffaqiyatli saqlandi</span>
          </div>
        )}

        {showSignOutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSignOutConfirm(false)} />
            <div className="relative bg-white dark:bg-neutral-950 p-6 md:p-8 max-w-sm w-full mx-4 shadow-2xl z-10 text-center border border-neutral-100 dark:border-neutral-805 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Chiqmoqchimisiz?</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Hisobingizdan chiqishga aminmisiz?</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSignOutConfirm(false)} className="flex-1 border border-neutral-200 dark:border-neutral-750 py-3 text-xs font-bold uppercase tracking-widest text-black dark:text-white hover:border-neutral-400 dark:hover:border-neutral-550 transition-colors">
                  Bekor qilish
                </button>
                <button onClick={async () => { setShowSignOutConfirm(false); await signOut(); navigate('/'); }} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors">
                  Chiqish
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white dark:bg-neutral-950 p-6 md:p-8 max-w-sm w-full mx-4 shadow-2xl z-10 text-center border border-neutral-100 dark:border-neutral-805 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto">
                <span className="text-red-600 text-xl font-bold">!</span>
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-red-650 dark:text-red-400">Hisobni o'chirasizmi?</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">Bu amal qaytarilmaydi. Barcha ma'lumotlaringiz, buyurtmalaringiz va tarixingiz o'chiriladi.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-neutral-200 dark:border-neutral-750 py-3 text-xs font-bold uppercase tracking-widest text-black dark:text-white hover:border-neutral-400 dark:hover:border-neutral-550 transition-colors">
                  Bekor qilish
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); navigate('/'); }} className="flex-1 bg-red-600 text-white py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors">
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmCancelId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmCancelId(null)} />
            <div className="relative bg-white dark:bg-neutral-950 p-6 md:p-8 max-w-sm w-full mx-4 shadow-2xl z-10 text-center border border-neutral-100 dark:border-neutral-805 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Buyurtmani bekor qilasizmi?</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{confirmCancelId} bekor qilinadi. Bu amalni qaytarib bo'lmaydi.</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmCancelId(null)}
                  className="flex-1 border border-neutral-200 dark:border-neutral-750 py-3 text-xs font-bold uppercase tracking-widest text-black dark:text-white hover:border-neutral-400 dark:hover:border-neutral-550 transition-colors"
                >
                  Yo'q
                </button>
                <button
                  onClick={() => handleCancelOrder(confirmCancelId)}
                  disabled={cancellingId === confirmCancelId}
                  className="flex-1 bg-red-600 text-white py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {cancellingId === confirmCancelId ? 'Bekor qilinmoqda...' : 'Ha, bekor qilish'}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewOrder(null)} />
            <div className="relative bg-white dark:bg-neutral-950 max-w-lg w-full mx-4 shadow-2xl z-10 border border-neutral-100 dark:border-neutral-805 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">{viewOrder.orderId}</h3>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">{viewOrder.timeAgo}</span>
                </div>
                <button onClick={() => setViewOrder(null)} className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Holati</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                    viewOrder.status === 'SHIPPED' || viewOrder.status === 'DELIVERED' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-455' :
                    viewOrder.status === 'PROCESSING' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-455' :
                    viewOrder.status === 'PENDING' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400' :
                    'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                  }`}>
                    {statusLabel(viewOrder.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">Mahsulotlar</span>
                  {(viewOrder.items ?? []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 border border-neutral-100 dark:border-neutral-800 p-3">
                      {item.image && (
                        <div className="w-12 h-12 rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-750 flex-shrink-0 bg-neutral-50 dark:bg-neutral-900">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs font-bold text-black dark:text-white truncate">{item.name}</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">
                          {[item.size, item.color].filter(Boolean).join(' · ')}{(item.size || item.color) ? ' · ' : ''}Soni: {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-black text-black dark:text-white flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Jami</span>
                  <span className="text-sm font-black text-black dark:text-white">{formatPrice(viewOrder.amount)}</span>
                </div>

                {isOrderCancellable(viewOrder) && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">
                    <Clock className="w-3.5 h-3.5" />
                    Bepul bekor qilish {formatCountdown(orderRemainingMs(viewOrder))} da tugaydi
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    onClick={() => setConfirmCancelId(viewOrder.orderId)}
                    disabled={!isOrderCancellable(viewOrder) || cancellingId === viewOrder.orderId}
                    className="flex-1 flex items-center justify-center gap-2 border border-red-300 dark:border-red-900/50 text-red-650 dark:text-red-400 text-[10px] font-bold uppercase px-5 py-3 tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {cancellingId === viewOrder.orderId ? 'Bekor qilinmoqda...' : viewOrder.status === 'CANCELLED' ? 'Buyurtma bekor qilindi' : 'Buyurtmani bekor qilish'}
                  </button>
                  <a
                    href={OPERATOR_TELEGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase px-5 py-3 tracking-widest hover:opacity-90 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Operator bilan bog'lanish
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 flex flex-col items-center text-center space-y-4 bg-white dark:bg-neutral-950 transition-colors">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-750">
                <img src={userInfo.avatar} alt={userInfo.name} className="w-full h-full object-cover grayscale" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black dark:text-white">{userInfo.name}</h2>
                <span className="text-[9px] font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black px-3 py-1 inline-block">
                  {userInfo.memberTier}
                </span>
              </div>
              <div className="w-full space-y-2 pt-2 text-xs text-neutral-500 dark:text-neutral-450 font-medium">
                <div className="flex items-center space-x-2 justify-center">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{userInfo.email}</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{userInfo.phone}</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block border border-neutral-200 dark:border-neutral-800 p-2 bg-white dark:bg-neutral-950 transition-colors">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all focus:outline-none ${
                      active 
                        ? 'bg-black text-white dark:bg-white dark:text-black' 
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 stroke-[1.5]" />
                      <span>{item.label}</span>
                      {item.id === 'wishlist' && wishlist.length > 0 && (
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'}`}>
                          {wishlist.length}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                );
              })}
              <button 
                onClick={() => setShowSignOutConfirm(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all mt-2 border-t border-neutral-100 dark:border-neutral-850 pt-4 focus:outline-none"
              >
                <LogOut className="w-4 h-4 stroke-[1.5]" />
                <span>Chiqish</span>
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-8 bg-white dark:bg-neutral-900 transition-colors">

            {/* Mobile Quick Actions */}
            <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex flex-col items-center justify-center py-5 border transition-all space-y-2 focus:outline-none ${
                      activeSection === item.id 
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                        : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-neutral-150 dark:border-neutral-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[1.5]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                    {item.id === 'wishlist' && wishlist.length > 0 && (
                      <span className="text-[8px] bg-white dark:bg-black text-black dark:text-white px-1.5 py-0.5 rounded-full font-bold">{wishlist.length}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800 pb-3 text-black dark:text-white">
                  Umumiy ma'lumot
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-neutral-200 dark:border-neutral-800 p-4 text-center space-y-1 bg-white dark:bg-neutral-950">
                    <span className="text-2xl font-black text-black dark:text-white">{orders.length}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">Jami buyurtmalar</span>
                  </div>
                  <div className="border border-neutral-200 dark:border-neutral-800 p-4 text-center space-y-1 bg-white dark:bg-neutral-950">
                    <span className="text-2xl font-black text-black dark:text-white">{cartCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">Savatda</span>
                  </div>
                  <div className="border border-neutral-200 dark:border-neutral-800 p-4 text-center space-y-1 bg-white dark:bg-neutral-950">
                    <span className="text-2xl font-black text-black dark:text-white">{wishlist.length}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">Sevimlilar</span>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 text-left">So'nggi buyurtmalar</h4>
                  {orders.length > 0 ? orders.slice(0, 3).map((ord) => (
                    <div key={ord.orderId} className="border border-neutral-200 dark:border-neutral-800 p-4 flex justify-between items-center bg-white dark:bg-neutral-950 transition-colors">
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-bold text-black dark:text-white">{ord.orderId}</span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-550 font-semibold block">{ord.timeAgo}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <span className="text-xs font-bold text-black dark:text-white block">
                          {formatPrice(ord.amount)}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          ord.status === 'SHIPPED' || ord.status === 'DELIVERED' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-455' :
                          ord.status === 'PROCESSING' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-455' :
                          'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                        }`}>
                          {statusLabel(ord.status)}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium py-4 text-center">Hozircha buyurtmalar yo'q</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link to="/collections" className="flex-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase py-3.5 tracking-widest text-center hover:opacity-90">
                    Xarid qilish
                  </Link>
                  <Link to="/bag" className="flex-1 border border-neutral-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold uppercase py-3.5 tracking-widest text-center hover:border-neutral-400 dark:hover:border-neutral-550">
                    Savatni ko'rish ({cartCount})
                  </Link>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Buyurtmalarim</h3>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest">{orders.length} ta buyurtma</span>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => {
                      const cancellable = isOrderCancellable(ord);
                      return (
                      <div
                        key={ord.orderId}
                        onClick={() => setViewOrder(ord)}
                        className="border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col gap-4 bg-white dark:bg-neutral-950 transition-colors cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            {ord.customerAvatar && (
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-750 flex-shrink-0">
                                <img src={ord.customerAvatar} alt="" className="w-full h-full object-cover grayscale" />
                              </div>
                            )}
                            <div className="space-y-0.5 text-left">
                              <span className="text-sm font-bold text-black dark:text-white block">{ord.orderId}</span>
                              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">{ord.timeAgo} &bull; {ord.itemsCount} ta mahsulot</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 justify-between md:justify-end">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                              ord.status === 'SHIPPED' || ord.status === 'DELIVERED' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-455' :
                              ord.status === 'PROCESSING' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-455' :
                              ord.status === 'PENDING' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400' :
                              'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                            }`}>
                              {statusLabel(ord.status)}
                            </span>
                            <span className="text-sm font-black text-black dark:text-white">
                              {formatPrice(ord.amount)}
                            </span>
                          </div>
                        </div>

                        {cancellable && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between gap-3 border-t border-neutral-100 dark:border-neutral-800 pt-3"
                          >
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest uppercase">
                              <Clock className="w-3.5 h-3.5" />
                              {formatCountdown(orderRemainingMs(ord))} ichida bekor qiling
                            </span>
                            <button
                              onClick={() => setConfirmCancelId(ord.orderId)}
                              disabled={cancellingId === ord.orderId}
                              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              {cancellingId === ord.orderId ? 'Bekor qilinmoqda...' : 'Buyurtmani bekor qilish'}
                            </button>
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 transition-colors">
                    <Package className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Hozircha buyurtmalar yo'q</p>
                    <Link to="/collections" className="inline-block bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase px-6 py-3 tracking-widest hover:opacity-90">
                      Xaridni boshlash
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Section */}
            {activeSection === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Sevimlilarim</h3>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest">{wishlistProducts.length} ta mahsulot</span>
                </div>

                {wishlistProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlistProducts.map((item) => (
                      <ProductCard key={item.id} product={item} variant="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 transition-colors">
                    <Heart className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Sevimlilar ro'yxati bo'sh</p>
                    <Link to="/collections" className="inline-block bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase px-6 py-3 tracking-widest hover:opacity-90">
                      Kolleksiyalarni ko'rish
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Locations Section */}
            {activeSection === 'locations' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Saqlangan manzillar</h3>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest">{addresses.length} ta saqlangan</span>
                </div>

                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-neutral-200 dark:border-neutral-800 p-4 flex justify-between items-start gap-4 bg-white dark:bg-neutral-950 transition-colors">
                        <div className="space-y-0.5 text-left">
                          <p className="text-xs font-bold text-black dark:text-white">{addr.first_name} {addr.last_name}</p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{addr.phone}</p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            {addr.city}, {addr.district}, {addr.neighborhood}, {addr.house_number}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded flex-shrink-0"
                          aria-label="Manzilni o'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 transition-colors">
                    <MapPin className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Hozircha saqlangan manzillar yo'q</p>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 px-6">To'lov paytida kiritgan manzillaringiz keyingi safar uchun shu yerda saqlanadi.</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800 pb-3 text-black dark:text-white">
                  Hisob sozlamalari
                </h3>

                <div className="space-y-4">
                  <div className="border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 bg-white dark:bg-neutral-950 transition-colors">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Shaxsiy ma'lumotlar</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">To'liq ism</label>
                        <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-black dark:text-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black dark:focus:border-white" />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Email</label>
                        <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Email manzil qo'shing" className="w-full border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-black dark:text-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black dark:focus:border-white" />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Telefon</label>
                        <input type="tel" value={userInfo.phone} disabled title="Telegram orqali tasdiqlangan — raqamni o'zgartirish uchun qo'llab-quvvatlash xizmatiga murojaat qiling" className="w-full border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-3 py-2.5 text-xs font-semibold cursor-not-allowed" />
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500">Telegram orqali tasdiqlangan, bu yerda o'zgartirib bo'lmaydi.</p>
                      </div>
                    </div>
                    {saveError && <p className="text-[10px] font-bold text-red-600 dark:text-red-400">{saveError}</p>}
                    <button onClick={handleSave} disabled={savingProfile} className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase px-6 py-3 tracking-widest hover:opacity-90 transition-colors focus:outline-none disabled:opacity-50">
                      {savingProfile ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
                    </button>
                  </div>

                  <div className="border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 bg-white dark:bg-neutral-950 transition-colors">
                    <h4 className="text-xs font-black uppercase tracking-widest text-black dark:text-white text-left">Bildirishnomalar</h4>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-neutral-750 dark:text-neutral-300">Buyurtmalar uchun email bildirishnomalari</span>
                      <div 
                        onClick={() => setEmailNotif(!emailNotif)}
                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${emailNotif ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-850'}`}
                        role="switch"
                        aria-checked={emailNotif}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white dark:bg-neutral-900 rounded-full transition-transform ${emailNotif ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-neutral-750 dark:text-neutral-300">Marketing xatlari</span>
                      <div 
                        onClick={() => setMarketingEmails(!marketingEmails)}
                        className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${marketingEmails ? 'bg-black dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-850'}`}
                        role="switch"
                        aria-checked={marketingEmails}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white dark:bg-neutral-900 rounded-full transition-transform ${marketingEmails ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                  </div>

                  <div className="border border-red-200 dark:border-red-950/40 p-5 bg-white dark:bg-neutral-950 transition-colors">
                    <h4 className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-2 text-left">Xavfli hudud</h4>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mb-3 text-left">Hisobingiz va unga tegishli barcha ma'lumotlarni butunlay o'chiring.</p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="border border-red-300 dark:border-red-900/50 text-red-650 dark:text-red-400 text-[10px] font-bold uppercase px-5 py-2.5 tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors focus:outline-none"
                    >
                      Hisobni o'chirish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
