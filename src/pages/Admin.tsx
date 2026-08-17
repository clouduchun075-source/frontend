import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, ShoppingBag, Users,
  Plus, Search, ArrowLeft, Folder,
  TrendingUp, Clock, CheckCircle, XCircle,
  Pencil, Trash2, X, LogOut, Wallet, RefreshCw, Send, Upload, ImagePlus, Star, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getProducts, saveProduct, deleteProduct, uploadProductImage,
  getOrders, updateOrderStatus, notifyOrderStatus,
  getTransactions, addTransaction,
  getSummary, getAdminUsers, banUser, unbanUser, deleteUser
} from '../data/api';
import type { Product } from '../data/api';
import {
  getAllCategories, addCategory, removeCategory, isCustomCategory,
  getAllBrands, addBrand, removeBrand, isCustomBrand,
  getAllTags, addTag, removeTag, isCustomTag,
  getAllColors, addColor, removeColor, isCustomColor,
  type ColorOption,
} from '../utils/productTaxonomy';

// Press-and-hold (long press) handlers -- used so admins can delete a
// custom option they added by mistake, without an accidental single click
// nuking it. Only fires onLongPress if the press is held past the threshold.
// (Plain helper, not a React hook -- safe to call inside .map() callbacks.)
function longPressHandlers(onLongPress: () => void, ms = 600) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const start = () => { timer = setTimeout(onLongPress, ms); };
  const clear = () => { if (timer) clearTimeout(timer); };
  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  };
}

// Matches the customer-facing self-cancel window in CartContext. Orders
// placed less than this long ago are still "New" (customer can still cancel
// them themselves) before an operator confirms them.
const ORDER_NEW_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const Admin = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    if (localStorage.getItem('sayway_admin_token')) setLoggedIn(true);
  }, []);

  const handleLogin = () => {
    if (['admin123', 'salom123', 'admin'].includes(password) && username === 'admin') {
      localStorage.setItem('sayway_admin_token', '1');
      setLoggedIn(true);
    } else {
      setLoginError('Login yoki parol xato');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sayway_admin_token');
    setLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight">SAYPAID</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Admin Panel</p>
          </div>
          <div className="space-y-4">
            {loginError && <div className="text-xs font-bold text-red-600 bg-red-50 p-3 tracking-wide">{loginError}</div>}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Login</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-neutral-50 border border-neutral-200 text-xs px-4 py-3 focus:outline-none focus:border-black font-semibold" placeholder="admin" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Parol</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-neutral-50 border border-neutral-200 text-xs px-4 py-3 focus:outline-none focus:border-black font-semibold" placeholder="admin123" />
            </div>
            <button onClick={handleLogin} className="w-full bg-black text-white text-xs font-bold uppercase py-4 tracking-widest hover:opacity-90">Kirish</button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} onBack={() => navigate('/')} />;
};

const AdminPanel = ({ activeTab, setActiveTab, onLogout, onBack }: {
  activeTab: string; setActiveTab: (t: string) => void; onLogout: () => void; onBack: () => void;
}) => {
  const tabs = [
    { name: 'Dashboard', icon: LayoutDashboard, label: 'Boshqaruv paneli' },
    { name: 'Products', icon: Folder, label: 'Mahsulotlar' },
    { name: 'Orders', icon: ShoppingBag, label: 'Buyurtmalar' },
    { name: 'Customers', icon: Users, label: 'Mijozlar' },
    { name: 'Accounting', icon: Wallet, label: 'Hisob-kitob' },
  ];
  const tabLabel = (name: string) => tabs.find(t => t.name === name)?.label || name;

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="hidden lg:flex w-60 bg-white border-r border-neutral-200 flex-col p-6 fixed h-screen">
        <div className="flex items-center justify-between mb-10">
          <span className="text-xl font-black tracking-tight">SAYPAID</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-100 px-2 py-1">Admin</span>
        </div>
        <nav className="flex flex-col gap-1 flex-grow">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                className={`flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === tab.name ? 'bg-black text-white' : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                }`}>
                <Icon className="w-4 h-4 stroke-[1.8]" /><span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <button onClick={onBack} className="w-full flex items-center space-x-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">
            <ArrowLeft className="w-4 h-4" /><span>Do'konga qaytish</span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700">
            <LogOut className="w-4 h-4" /><span>Chiqish</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8 lg:ml-60 max-w-6xl">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 text-neutral-500 hover:text-black"><ArrowLeft className="w-5 h-5 stroke-[2]" /></button>
            <h1 className="text-lg font-black uppercase tracking-tight">{tabLabel(activeTab)}</h1>
          </div>
          <button onClick={onLogout} className="text-red-500 p-2"><LogOut className="w-5 h-5" /></button>
        </div>
        <div className="lg:hidden flex overflow-x-auto gap-2 mb-6 scrollbar-hide pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.name} onClick={() => setActiveTab(tab.name)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex-shrink-0 border ${
                  activeTab === tab.name ? 'bg-black border-black text-white' : 'bg-white border-neutral-200 text-neutral-600'
                }`}>
                <Icon className="w-3.5 h-3.5" /><span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        {activeTab === 'Dashboard' && <DashboardTab />}
        {activeTab === 'Products' && <ProductsTab />}
        {activeTab === 'Orders' && <OrdersTab />}
        {activeTab === 'Customers' && <CustomersTab />}
        {activeTab === 'Accounting' && <AccountingTab />}
      </main>
    </div>
  );
};

// All admin figures are shown in Uzbek so'm now, matching the rest of the
// site (product prices are still stored USD-basis internally at
// 1 USD = 12,600 UZS -- see CartContext.formatPrice for the same rate).
const fmt = (n: number) => Math.round(n * 12600).toLocaleString('uz-UZ') + " so'm";
const statusBadge = (s: string) => {
  if (s === 'SHIPPED' || s === 'DELIVERED') return 'bg-green-50 text-green-700';
  if (s === 'PROCESSING') return 'bg-blue-50 text-blue-700';
  if (s === 'CANCELLED') return 'bg-red-50 text-red-700';
  return 'bg-neutral-100 text-neutral-500';
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Kutilmoqda',
  PROCESSING: 'Jarayonda',
  SHIPPED: 'Yuborildi',
  DELIVERED: 'Yetkazildi',
  CANCELLED: 'Bekor qilindi',
};
const statusLabel = (s: string) => STATUS_LABELS[s] || s;

// ======================== DASHBOARD ========================
const DashboardTab = () => {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getSummary>> | null>(null);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getOrders>>>([]);

  useEffect(() => {
    getSummary().then(setSummary);
    getOrders().then(all => setOrders(all.slice(0, 5)));
  }, []);

  if (!summary) {
    return <div className="text-xs text-neutral-400 font-medium">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="hidden lg:block mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight">Boshqaruv paneli</h1>
        <p className="text-xs text-neutral-400 font-medium tracking-wide">Do'koningizga umumiy nazar.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Daromad', value: fmt(summary.total_revenue), change: `${summary.total_orders} buyurtma`, up: true },
          { label: 'Sof foyda', value: fmt(summary.net_profit), change: summary.net_profit >= 0 ? 'Musbat' : 'Manfiy', up: summary.net_profit >= 0 },
          { label: 'Mahsulotlar', value: String(summary.total_products), change: `${summary.low_stock} kam qoldi`, up: summary.low_stock === 0 },
          { label: 'Ombor', value: fmt(summary.total_inventory_value), change: `${summary.total_stock} dona`, up: true },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-200 p-4 md:p-5 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{s.label}</span>
            <div className="text-lg md:text-xl font-black text-black">{s.value}</div>
            <span className={`text-[9px] font-bold ${s.up ? 'text-green-600' : 'text-red-600'}`}>{s.change}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Kutilmoqda', value: summary.pending, icon: Clock },
          { label: 'Yakunlangan', value: summary.completed, icon: CheckCircle },
          { label: 'Bekor qilingan', value: summary.cancelled, icon: XCircle },
          { label: "O'rtacha buyurtma", value: fmt(summary.avg_order), icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-200 p-4 flex items-center space-x-3">
            <s.icon className="w-5 h-5 text-neutral-400" />
            <div><div className="text-base font-black">{s.value}</div><span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{s.label}</span></div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-100"><h3 className="text-xs font-black uppercase tracking-wider">So'nggi buyurtmalar</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
              <th className="px-5 py-3 text-left">ID</th><th className="px-5 py-3 text-left">Mijoz</th><th className="px-5 py-3 text-left">Jami</th><th className="px-5 py-3 text-left">Holati</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-50">
              {orders.length > 0 ? orders.map(o => {
                const oid = o.id || o.orderId || 'ORD-UNKNOWN';
                const cname = o.customer_name || o.customerName || 'Mehmon';
                const tot = typeof o.total === 'number' ? o.total : (typeof o.amount === 'number' ? o.amount : 0);
                return (
                  <tr key={oid} className="hover:bg-neutral-50/50">
                    <td className="px-5 py-3.5 font-bold text-black">{oid}</td>
                    <td className="px-5 py-3.5 font-semibold text-neutral-700">{cname}</td>
                    <td className="px-5 py-3.5 font-black text-black">{fmt(tot)}</td>
                    <td className="px-5 py-3.5"><span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${statusBadge(o.status)}`}>{statusLabel(o.status)}</span></td>
                  </tr>
                );
              }) : <tr><td colSpan={4} className="px-5 py-8 text-center text-neutral-400">Hozircha buyurtmalar yo'q</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ======================== PRODUCTS ========================
const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState('');
  const reload = () => { getProducts().then(setProducts); };
  useEffect(() => { reload(); }, []);
  useEffect(() => { if (showModal === false) reload(); }, [showModal]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) || p.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Bu mahsulotni o'chirmoqchimisiz?")) return;
    await deleteProduct(id); reload();
    setToast("Mahsulot o'chirildi"); setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-black text-white text-xs font-bold uppercase py-3 px-5 tracking-widest">{toast}</div>}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="hidden lg:block"><h1 className="text-2xl font-black uppercase tracking-tight">Mahsulotlar</h1><p className="text-xs text-neutral-400 font-medium">{products.length} mahsulot</p></div>
        <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="flex items-center space-x-2 bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-90">
          <Plus className="w-4 h-4 stroke-[2]" /><span>Mahsulot qo'shish</span>
        </button>
      </div>
      <div className="bg-white border border-neutral-200">
        <div className="px-5 py-3 border-b border-neutral-100">
          <div className="relative w-full md:w-72"><input type="text" placeholder="Mahsulotlarni qidirish..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-4 py-2.5 pr-10 focus:outline-none focus:border-black font-semibold" /><Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400 stroke-[1.5]" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
              <th className="px-5 py-3 text-left">Mahsulot</th><th className="px-5 py-3 text-left">Kategoriya</th><th className="px-5 py-3 text-left">Narx</th><th className="px-5 py-3 text-left">Zaxira</th><th className="px-5 py-3 text-left">Holati</th><th className="px-5 py-3 text-right">Amallar</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50/50">
                  <td className="px-5 py-3"><div className="flex items-center space-x-3"><div className="w-10 h-12 bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0"><img src={p.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div><div><div className="font-bold text-black">{p.name}</div><div className="text-[10px] text-neutral-400">{p.subtitle}</div></div></div></td>
                  <td className="px-5 py-3 text-neutral-600">{p.category}</td>
                  <td className="px-5 py-3 font-black text-black">{fmt(p.price)}</td>
                  <td className="px-5 py-3 font-bold">{p.stock}</td>
                  <td className="px-5 py-3">{p.stock < 10 ? <span className="text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700">Kam qoldi</span> : <span className="text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-green-50 text-green-700">Zaxirada bor</span>}</td>
                  <td className="px-5 py-3 text-right"><div className="flex items-center justify-end space-x-2">
                    <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-400">Mahsulot topilmadi</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <ProductModal product={editProduct} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); setToast(editProduct ? 'Mahsulot yangilandi' : "Mahsulot qo'shildi"); setTimeout(() => setToast(''), 3000); }} />}
    </div>
  );
};

// Single-select dropdown (looks/behaves like a native <select>) used for
// Category / Brand / Tag, with an "+ Add new" row at the bottom of the menu
// so the admin isn't locked into a fixed list -- anything typed in there is
// remembered (see utils/productTaxonomy.ts) and shows up as a real filter
// choice on the storefront too.
const ChipSelect = ({
  options, value, onChange, onAddOption, onDeleteOption, isCustomOption, allowNone,
}: {
  options: string[]; value: string; onChange: (v: string) => void; onAddOption: (v: string) => void;
  onDeleteOption?: (v: string) => void; isCustomOption?: (v: string) => boolean; allowNone?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState('');
  // A long-press ends with the browser also firing a normal click (since
  // mousedown+mouseup happened on the same element) -- suppress that one
  // click so a just-deleted option doesn't get re-selected right after.
  const suppressClickRef = useRef(false);

  const close = () => { setOpen(false); setAdding(false); setInput(''); };
  const confirmAdd = () => {
    const val = input.trim();
    if (val) { onAddOption(val); onChange(val); }
    close();
  };

  const handleLongPressDelete = (opt: string) => {
    if (!onDeleteOption) return;
    suppressClickRef.current = true;
    if (!confirm(`"${opt}"ni bu ro'yxatdan o'chirmoqchimisiz?`)) return;
    onDeleteOption(opt);
    if (value === opt) onChange('');
  };

  const handleOptionClick = (opt: string) => {
    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
    onChange(opt);
    close();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black"
      >
        <span className={value ? 'font-semibold text-black' : 'text-neutral-400'}>{value || "Yo'q"}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div className="absolute left-0 right-0 mt-1 bg-white border border-neutral-200 shadow-lg z-50 max-h-56 overflow-y-auto">
            {allowNone && (
              <button
                type="button"
                onClick={() => { onChange(''); close(); }}
                className={`w-full text-left text-xs px-3 py-2.5 hover:bg-neutral-50 ${value === '' ? 'font-bold text-black bg-neutral-50' : 'text-neutral-600'}`}
              >
                Yo'q
              </button>
            )}
            {options.map(opt => {
              const deletable = isCustomOption?.(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleOptionClick(opt)}
                  title={deletable ? "O'chirish uchun bosib turing" : undefined}
                  {...(deletable ? longPressHandlers(() => handleLongPressDelete(opt)) : {})}
                  className={`w-full text-left text-xs px-3 py-2.5 hover:bg-neutral-50 select-none ${value === opt ? 'font-bold text-black bg-neutral-50' : 'text-neutral-600'}`}
                >
                  {opt}
                </button>
              );
            })}
            <div className="border-t border-neutral-100">
              {adding ? (
                <div className="flex items-center gap-1.5 px-2.5 py-2">
                  <input
                    autoFocus
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') { setAdding(false); setInput(''); } }}
                    placeholder="Yangi variant"
                    className="flex-1 text-xs px-2 py-1.5 border border-neutral-200 focus:outline-none focus:border-black"
                  />
                  <button type="button" onClick={confirmAdd} className="text-[10px] font-bold uppercase text-black hover:opacity-70">Qo'shish</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="w-full flex items-center gap-1.5 text-left text-xs px-3 py-2.5 text-neutral-500 hover:text-black hover:bg-neutral-50"
                >
                  <Plus className="w-3 h-3" /> Yangi qo'shish
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Standard size run -- shown as checkboxes so the admin can just tick what
// this product comes in, matching the exact strings Collections.tsx's size
// filter checks against. Anything typed in via "+ Add size" (e.g. "OS" for
// one-size accessories) is kept too, just shown separately.
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductModal = ({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) => {
  const [form, setForm] = useState({
    name: product?.name || '', price: String(product?.price || ''), category: product?.category || 'Outerwear',
    brand: product?.brand || 'SAYPAID BLACK LABEL', subtitle: product?.subtitle || '', stock: String(product?.stock || 0),
    tag: product?.tag || '',
    description: product?.description || '', material: product?.material || '', weight: product?.weight || '',
    color: product?.color || 'black', discount: product?.discount ? String(product.discount) : '',
  });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.size || ['M']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [addingCustomSize, setAddingCustomSize] = useState(false);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };
  const addCustomSize = () => {
    const val = customSizeInput.trim().toUpperCase();
    if (val && !selectedSizes.includes(val)) setSelectedSizes(prev => [...prev, val]);
    setCustomSizeInput('');
    setAddingCustomSize(false);
  };
  const customSizes = selectedSizes.filter(s => !STANDARD_SIZES.includes(s));

  // Press-and-hold a custom size to delete it, same as the other pickers.
  // (The X button still works too, for a quick no-confirm removal.)
  const sizeSuppressClickRef = useRef(false);
  const handleLongPressDeleteSize = (size: string) => {
    sizeSuppressClickRef.current = true;
    if (!confirm(`"${size}" o'lchamini o'chirmoqchimisiz?`)) return;
    setSelectedSizes(prev => prev.filter(s => s !== size));
  };
  const handleSizeChipClick = (size: string) => {
    if (sizeSuppressClickRef.current) { sizeSuppressClickRef.current = false; return; }
    toggleSize(size);
  };

  const [categoryOptions, setCategoryOptions] = useState(() => {
    const all = getAllCategories();
    return product?.category && !all.includes(product.category) ? [...all, product.category] : all;
  });
  const [brandOptions, setBrandOptions] = useState(() => {
    const all = getAllBrands();
    return product?.brand && !all.includes(product.brand) ? [...all, product.brand] : all;
  });
  const [tagOptions, setTagOptions] = useState(() => {
    const all = getAllTags();
    return product?.tag && !all.includes(product.tag) ? [...all, product.tag] : all;
  });
  const [colorOptions, setColorOptions] = useState<ColorOption[]>(() => {
    const all = getAllColors();
    return product?.color && !all.some(c => c.name === product.color)
      ? [...all, { name: product.color, hex: '#999999', label: product.color }]
      : all;
  });
  const [addingColor, setAddingColor] = useState(false);
  const [newColorLabel, setNewColorLabel] = useState('');
  const [newColorHex, setNewColorHex] = useState('#888888');

  const handleAddColor = () => {
    const label = newColorLabel.trim();
    if (!label) return;
    const name = label.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const color: ColorOption = { name, hex: newColorHex, label };
    addColor(color);
    setColorOptions(prev => [...prev, color]);
    set('color', name);
    setNewColorLabel('');
    setNewColorHex('#888888');
    setAddingColor(false);
  };

  // Press-and-hold a custom color swatch to delete it (defaults can't be
  // removed). See suppressClickRef note on ChipSelect -- same reasoning.
  const colorSuppressClickRef = useRef(false);
  const handleDeleteColor = (c: ColorOption) => {
    colorSuppressClickRef.current = true;
    if (!confirm(`"${c.label}" rangini o'chirmoqchimisiz?`)) return;
    setColorOptions(prev => prev.filter(o => o.name !== c.name));
    removeColor(c.name);
    if (form.color === c.name) set('color', '');
  };
  const handleColorClick = (name: string) => {
    if (colorSuppressClickRef.current) { colorSuppressClickRef.current = false; return; }
    set('color', name);
  };

  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0 ? product.images : (product?.image ? [product.image] : [])
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        uploaded.push(await uploadProductImage(file));
      }
      setImages(prev => [...prev, ...uploaded]);
    } catch (err) {
      setUploadError((err as Error).message || 'Yuklash amalga oshmadi');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));
  const makeMain = (idx: number) => setImages(prev => [prev[idx], ...prev.filter((_, i) => i !== idx)]);

  const handleSave = async () => {
    if (!form.name || !form.price || images.length === 0 || selectedSizes.length === 0) return;
    await saveProduct({
      name: form.name, price: Number(form.price), category: form.category, brand: form.brand,
      subtitle: form.subtitle, stock: Number(form.stock), tag: form.tag || null,
      size: selectedSizes,
      image: images[0], images,
      description: form.description, material: form.material, weight: form.weight, color: form.color,
      discount: form.discount ? Number(form.discount) : undefined,
      ...(product ? { id: product.id } : {}),
    });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black uppercase tracking-widest">{product ? 'Mahsulotni tahrirlash' : "Mahsulot qo'shish"}</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Nomi</label><input value={form.name} onChange={e => set('name', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Narxi (baza qiymati, so'mda ko'rsatiladi)</label><input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Kategoriya</label>
            <ChipSelect
              options={categoryOptions}
              value={form.category}
              onChange={v => set('category', v)}
              onAddOption={v => { setCategoryOptions(prev => [...prev, v]); addCategory(v); }}
              onDeleteOption={v => { setCategoryOptions(prev => prev.filter(o => o !== v)); removeCategory(v); }}
              isCustomOption={isCustomCategory}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Brend</label>
            <ChipSelect
              options={brandOptions}
              value={form.brand}
              onChange={v => set('brand', v)}
              onAddOption={v => { setBrandOptions(prev => [...prev, v]); addBrand(v); }}
              onDeleteOption={v => { setBrandOptions(prev => prev.filter(o => o !== v)); removeBrand(v); }}
              isCustomOption={isCustomBrand}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Kichik sarlavha</label><input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Zaxira</label><input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Teg</label>
            <ChipSelect
              options={tagOptions}
              value={form.tag}
              onChange={v => set('tag', v)}
              onAddOption={v => { setTagOptions(prev => [...prev, v]); addTag(v); }}
              onDeleteOption={v => { setTagOptions(prev => prev.filter(o => o !== v)); removeTag(v); }}
              isCustomOption={isCustomTag}
              allowNone
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">O'lchamlar</label>
            <div className="flex flex-wrap gap-2">
              {STANDARD_SIZES.map(size => {
                const checked = selectedSizes.includes(size);
                return (
                  <label
                    key={size}
                    className={`flex items-center gap-1.5 px-3 py-2 border text-xs font-bold cursor-pointer select-none ${checked ? 'bg-black text-white border-black' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleSize(size)} className="hidden" />
                    {size}
                  </label>
                );
              })}
              {customSizes.map(size => (
                <span
                  key={size}
                  {...longPressHandlers(() => handleLongPressDeleteSize(size))}
                  title="O'chirish uchun bosib turing"
                  className="flex items-center gap-1.5 px-3 py-2 border border-black bg-black text-white text-xs font-bold select-none"
                >
                  {size}
                  <button type="button" onClick={() => handleSizeChipClick(size)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              ))}
              {addingCustomSize ? (
                <span className="flex items-center gap-1 border border-neutral-300 px-2 py-1">
                  <input
                    autoFocus
                    value={customSizeInput}
                    onChange={e => setCustomSizeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addCustomSize(); if (e.key === 'Escape') { setAddingCustomSize(false); setCustomSizeInput(''); } }}
                    placeholder="masalan, OS"
                    className="w-16 text-xs px-1 py-1 focus:outline-none"
                  />
                  <button type="button" onClick={addCustomSize} className="text-[10px] font-bold uppercase text-black hover:opacity-70">Qo'shish</button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingCustomSize(true)}
                  className="flex items-center gap-1 px-3 py-2 border border-dashed border-neutral-300 text-xs font-bold text-neutral-500 hover:border-black hover:text-black transition-colors"
                >
                  <Plus className="w-3 h-3" /> O'lcham qo'shish
                </button>
              )}
            </div>
            {selectedSizes.length === 0 && <p className="text-[10px] text-neutral-400">Kamida bitta o'lchamni tanlang.</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Rang</label>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {colorOptions.map(c => {
                const deletable = isCustomColor(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleColorClick(c.name)}
                    title={deletable ? `${c.label} — o'chirish uchun bosib turing` : c.label}
                    {...(deletable ? longPressHandlers(() => handleDeleteColor(c)) : {})}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all select-none ${form.color === c.name ? 'ring-2 ring-offset-2 ring-black' : 'hover:scale-105'} ${c.name === 'white' ? 'border border-neutral-300' : ''}`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {form.color === c.name && <CheckCircle className={`w-3.5 h-3.5 ${c.name === 'white' ? 'text-black' : 'text-white'}`} />}
                  </button>
                );
              })}

              {addingColor ? (
                <span className="flex items-center gap-1.5 border border-neutral-300 px-2 py-1.5">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={e => setNewColorHex(e.target.value)}
                    className="w-6 h-6 p-0 border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    autoFocus
                    value={newColorLabel}
                    onChange={e => setNewColorLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddColor(); if (e.key === 'Escape') { setAddingColor(false); setNewColorLabel(''); } }}
                    placeholder="masalan, Ko'k"
                    className="w-20 text-xs px-1 py-1 focus:outline-none"
                  />
                  <button type="button" onClick={handleAddColor} className="text-[10px] font-bold uppercase text-black hover:opacity-70">Qo'shish</button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingColor(true)}
                  title="Yangi rang qo'shish"
                  className="w-7 h-7 rounded-full border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 hover:border-black hover:text-black transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Chegirma % (ixtiyoriy)</label><input type="number" min="0" max="90" value={form.discount} onChange={e => set('discount', e.target.value)} placeholder="masalan, 20" className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Rasmlar</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${dragOver ? 'border-black bg-neutral-50' : 'border-neutral-200'}`}
            >
              <input
                type="file"
                id="product-image-upload"
                accept="image/*"
                multiple
                onChange={e => handleFiles(e.target.files)}
                className="hidden"
              />
              <label htmlFor="product-image-upload" className="cursor-pointer flex flex-col items-center gap-1.5 text-neutral-400">
                <Upload className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {uploading ? 'Yuklanmoqda...' : "Rasmlarni shu yerga tashlang yoki tanlash uchun bosing"}
                </span>
              </label>
            </div>
            {uploadError && <p className="text-[10px] font-bold text-red-600">{uploadError}</p>}

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {images.map((url, idx) => (
                  <div key={url + idx} className="relative group aspect-square border border-neutral-200 rounded-md overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-black/80 text-white p-0.5 rounded-full"><Star className="w-2.5 h-2.5 fill-white" /></span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {idx !== 0 && (
                        <button type="button" onClick={() => makeMain(idx)} title="Asosiy rasm qilib belgilash" className="p-1 bg-white rounded-full">
                          <ImagePlus className="w-3 h-3 text-black" />
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(idx)} title="O'chirish" className="p-1 bg-white rounded-full">
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {images.length === 0 && <p className="text-[10px] text-neutral-400">Kamida bitta rasm talab qilinadi.</p>}
          </div>

          <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Tavsif</label><textarea value={form.description} onChange={e => set('description', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black min-h-[60px] resize-y" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Material</label><input value={form.material} onChange={e => set('material', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Vazni</label><input value={form.weight} onChange={e => set('weight', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-100">
          <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">Bekor qilish</button>
          <button onClick={handleSave} disabled={uploading || images.length === 0 || selectedSizes.length === 0} className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-40">{product ? "O'zgarishlarni saqlash" : "Mahsulot qo'shish"}</button>
        </div>
      </div>
    </div>
  );
};

// ======================== ORDERS ========================
type AdminOrder = Awaited<ReturnType<typeof getOrders>>[number];

// Orders under an hour old and still pending/processing are "New" -- the
// customer can still self-cancel them from the storefront. Once that window
// passes (or an operator moves them along), they fall into Confirmed.
const isNewOrder = (o: AdminOrder) => {
  if (o.status !== 'PENDING' && o.status !== 'PROCESSING') return false;
  const placedAt = o.created_at ? new Date(o.created_at).getTime() : 0;
  if (!placedAt) return false;
  return Date.now() - placedAt < ORDER_NEW_WINDOW_MS;
};

const orderBucket = (o: AdminOrder): 'new' | 'confirmed' | 'shipped' | 'cancelled' => {
  if (o.status === 'CANCELLED') return 'cancelled';
  if (o.status === 'SHIPPED' || o.status === 'DELIVERED') return 'shipped';
  if (isNewOrder(o)) return 'new';
  return 'confirmed';
};

const ORDER_SECTIONS: { key: 'new' | 'confirmed' | 'shipped' | 'cancelled'; label: string; hint: string; rowBg: string; badgeBg: string; dotColor: string }[] = [
  { key: 'new', label: 'Yangi buyurtmalar', hint: "Hozirgina joylashtirildi — mijoz hali o'zi bekor qilishi mumkin", rowBg: 'bg-amber-50/70 hover:bg-amber-50', badgeBg: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-400' },
  { key: 'confirmed', label: 'Tasdiqlangan / Jarayonda', hint: "Bekor qilish muddati o'tdi, tayyorlanmoqda", rowBg: 'bg-white hover:bg-neutral-50/50', badgeBg: 'bg-blue-50 text-blue-700', dotColor: 'bg-blue-400' },
  { key: 'shipped', label: 'Yuborilgan / Yetkazilgan', hint: 'Yo\'lda yoki yakunlangan', rowBg: 'bg-green-50/60 hover:bg-green-50', badgeBg: 'bg-green-100 text-green-700', dotColor: 'bg-green-400' },
  { key: 'cancelled', label: 'Bekor qilingan', hint: 'Mijoz yoki operator tomonidan bekor qilingan', rowBg: 'bg-red-50/70 hover:bg-red-50', badgeBg: 'bg-red-100 text-red-700', dotColor: 'bg-red-400' },
];

const OrdersTab = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [viewOrder, setViewOrder] = useState<AdminOrder | null>(null);
  const [, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const reload = () => { getOrders().then(setOrders); };
  const manualRefresh = async () => {
    setRefreshing(true);
    await getOrders().then(setOrders);
    setRefreshing(false);
  };
  useEffect(() => { reload(); }, []);

  // Orders can change from the storefront (customer places/cancels one)
  // while this tab is sitting open, and there's no realtime subscription --
  // so poll every few seconds to pick those changes up automatically.
  useEffect(() => {
    const poll = setInterval(reload, 8000);
    return () => clearInterval(poll);
  }, []);

  // Keep "New" badges/timers accurate as the 1-hour window ticks down.
  useEffect(() => {
    if (!orders.some(isNewOrder)) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [orders]);

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatus = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status); reload();
    setToast('Buyurtma yangilandi'); setTimeout(() => setToast(''), 3000);
  };

  const [sendingId, setSendingId] = useState<string | null>(null);
  const handleNotify = async (orderId: string) => {
    setSendingId(orderId);
    try {
      await notifyOrderStatus(orderId);
      setToast('Mijozga Telegram orqali yuborildi');
    } catch (err) {
      setToast((err as Error).message || 'Yuborish amalga oshmadi');
    } finally {
      setSendingId(null);
      setTimeout(() => setToast(''), 3500);
    }
  };

  const remainingLabel = (o: AdminOrder) => {
    const placedAt = o.created_at ? new Date(o.created_at).getTime() : 0;
    const ms = Math.max(0, ORDER_NEW_WINDOW_MS - (Date.now() - placedAt));
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-black text-white text-xs font-bold uppercase py-3 px-5 tracking-widest">{toast}</div>}
      <div className="hidden lg:block"><h1 className="text-2xl font-black uppercase tracking-tight">Buyurtmalar</h1><p className="text-xs text-neutral-400 font-medium">{orders.length} buyurtma</p></div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Jami', count: orders.length },
          { label: 'Yangi', count: orders.filter(isNewOrder).length },
          { label: 'Tasdiqlangan', count: orders.filter(o => orderBucket(o) === 'confirmed').length },
          { label: 'Yuborilgan', count: orders.filter(o => orderBucket(o) === 'shipped').length },
          { label: 'Bekor qilingan', count: orders.filter(o => orderBucket(o) === 'cancelled').length },
        ].map(s => (<div key={s.label} className="bg-white border border-neutral-200 p-3 text-center"><div className="text-lg font-black">{s.count}</div><span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{s.label}</span></div>))}
      </div>

      <div className="bg-white border border-neutral-200 px-5 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72"><input type="text" placeholder="Buyurtmalarni qidirish..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-4 py-2.5 pr-10 focus:outline-none focus:border-black font-semibold" /><Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400 stroke-[1.5]" /></div>
        <button
          onClick={manualRefresh}
          disabled={refreshing}
          className="flex-shrink-0 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500 border border-neutral-200 px-3 py-2.5 hover:border-black hover:text-black transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      {ORDER_SECTIONS.map(section => {
        const sectionOrders = filtered.filter(o => orderBucket(o) === section.key);
        if (sectionOrders.length === 0) return null;
        return (
          <div key={section.key} className="bg-white border border-neutral-200">
            <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${section.dotColor}`} />
              <h3 className="text-xs font-black uppercase tracking-widest text-black">{section.label}</h3>
              <span className="text-[10px] font-bold text-neutral-400">({sectionOrders.length})</span>
              <span className="hidden md:inline text-[10px] text-neutral-400 font-medium ml-2">{section.hint}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
                  <th className="px-5 py-3 text-left">ID</th><th className="px-5 py-3 text-left">Mijoz</th><th className="px-5 py-3 text-left">Mahsulotlar</th><th className="px-5 py-3 text-left">Jami</th><th className="px-5 py-3 text-left">Holati</th><th className="px-5 py-3 text-right">Amal</th>
                </tr></thead>
                <tbody className="divide-y divide-neutral-100">
                  {sectionOrders.map(o => {
                    const oid = o.id || o.orderId || 'ORD-UNKNOWN';
                    const cname = o.customer_name || o.customerName || 'Mehmon';
                    const tot = typeof o.total === 'number' ? o.total : (typeof o.amount === 'number' ? o.amount : 0);
                    return (
                      <tr key={oid} className={`cursor-pointer transition-colors ${section.rowBg}`} onClick={() => setViewOrder(o)}>
                        <td className="px-5 py-3 font-bold text-black">{oid}</td>
                        <td className="px-5 py-3 font-semibold text-neutral-700">{cname}</td>
                        <td className="px-5 py-3">{o.items?.length || 0}</td>
                        <td className="px-5 py-3 font-black text-black">{fmt(tot)}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${statusBadge(o.status)}`}>{statusLabel(o.status)}</span>
                          {section.key === 'new' && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-bold text-amber-700">
                              <Clock className="w-3 h-3" />{remainingLabel(o)}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <select value={o.status} onChange={e => handleStatus(oid, e.target.value)} className="text-[10px] font-bold uppercase tracking-wider border border-neutral-200 px-2 py-1.5 bg-white cursor-pointer focus:outline-none focus:border-black">
                              <option value="PENDING">Kutilmoqda</option><option value="PROCESSING">Jarayonda</option><option value="SHIPPED">Yuborildi</option><option value="DELIVERED">Yetkazildi</option><option value="CANCELLED">Bekor qilindi</option>
                            </select>
                            <button
                              onClick={() => handleNotify(oid)}
                              disabled={sendingId === oid}
                              title="Mijozga Telegram orqali xabar berish"
                              className="flex-shrink-0 p-2 border border-[#229ED9]/30 text-[#229ED9] hover:bg-[#229ED9]/10 transition-colors disabled:opacity-50"
                            >
                              <Send className={`w-3.5 h-3.5 ${sendingId === oid ? 'animate-pulse' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="bg-white border border-neutral-200 px-5 py-12 text-center text-neutral-400 text-xs">Hozircha buyurtmalar yo'q</div>
      )}
      {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </div>
  );
};

const OrderDetailModal = ({ order, onClose }: { order: Awaited<ReturnType<typeof getOrders>>[number]; onClose: () => void }) => {
  const oid = order.id || order.orderId || 'ORD-UNKNOWN';
  const addr = order.shipping_address;
  const fdate = (iso: string) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '-';
  const [notifyState, setNotifyState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [notifyMsg, setNotifyMsg] = useState('');

  const handleNotify = async () => {
    setNotifyState('sending');
    try {
      await notifyOrderStatus(oid);
      setNotifyState('sent');
    } catch (err) {
      setNotifyState('error');
      setNotifyMsg((err as Error).message || 'Yuborish amalga oshmadi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl z-10 rounded-2xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest">{oid}</h2>
            <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">{fdate(order.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Mijoz</h3>
            <div className="bg-neutral-50 rounded-xl p-4 space-y-1 text-xs">
              <p className="font-bold text-black">{order.customer_name || order.customerName || 'Mehmon'}</p>
              {order.customer_email && <p className="text-neutral-500">{order.customer_email}</p>}
            </div>
          </div>

          <div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Yetkazib berish ma'lumotlari</h3>
            {addr ? (
              <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div><span className="text-neutral-400 block text-[9px] uppercase font-bold">Ism</span><span className="font-semibold text-black">{addr.first_name} {addr.last_name}</span></div>
                  <div><span className="text-neutral-400 block text-[9px] uppercase font-bold">Telefon</span><span className="font-semibold text-black">{addr.phone}</span></div>
                  <div><span className="text-neutral-400 block text-[9px] uppercase font-bold">Shahar</span><span className="font-semibold text-black">{addr.city}</span></div>
                  <div><span className="text-neutral-400 block text-[9px] uppercase font-bold">Tuman</span><span className="font-semibold text-black">{addr.district}</span></div>
                  <div><span className="text-neutral-400 block text-[9px] uppercase font-bold">Mahalla</span><span className="font-semibold text-black">{addr.neighborhood}</span></div>
                  <div><span className="text-neutral-400 block text-[9px] uppercase font-bold">Uy / Ko'cha</span><span className="font-semibold text-black">{addr.house_number}</span></div>
                  {addr.postal_code && <div><span className="text-neutral-400 block text-[9px] uppercase font-bold">Pochta indeksi</span><span className="font-semibold text-black">{addr.postal_code}</span></div>}
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">Bu buyurtma uchun yetkazib berish ma'lumotlari kiritilmagan.</p>
            )}
          </div>

          <div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-2">Mahsulotlar</h3>
            <div className="border border-neutral-100 rounded-xl divide-y divide-neutral-50">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-2.5 text-xs">
                  {item.image && (
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-neutral-200 flex-shrink-0 bg-neutral-50">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-semibold text-black truncate">{item.name} <span className="text-neutral-400">&times;{item.quantity}</span></p>
                    {(item.size || item.color) && (
                      <p className="text-[10px] text-neutral-400 font-medium">
                        {[item.color, item.size ? `O'lcham ${item.size}` : null].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-black flex-shrink-0">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-baseline border-t border-neutral-100 pt-4">
            <span className="text-xs font-bold uppercase tracking-widest text-black">Jami</span>
            <span className="text-lg font-black text-black">{fmt(order.total ?? order.amount ?? 0)}</span>
          </div>

          <button
            onClick={handleNotify}
            disabled={notifyState === 'sending'}
            className="w-full flex items-center justify-center gap-2 bg-[#229ED9] text-white rounded-xl text-xs font-bold uppercase py-3 tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {notifyState === 'sending' ? 'Yuborilmoqda...' : notifyState === 'sent' ? 'Yuborildi!' : 'Mijozga Telegram orqali xabar berish'}
          </button>
          {notifyState === 'error' && (
            <p className="text-[10px] font-bold text-red-600 text-center -mt-2">{notifyMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ======================== CUSTOMERS ========================
const CustomersTab = () => {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getAdminUsers>>>([]);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getOrders>>>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = () => {
    Promise.all([getAdminUsers(), getOrders()])
      .then(([u, o]) => { setUsers(u); setOrders(o); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { reload(); }, []);

  // Every registered account shows up here, even with zero orders.
  // Orders are matched to an account by user_id first, falling back to
  // matching email for orders placed before a customer had an account.
  const customers = users.map(u => {
    const own = orders.filter(o => o.user_id === u.id || (u.email && o.customer_email === u.email));
    const total = own.reduce((s, o) => s + (o.total || 0), 0);
    return {
      id: u.id,
      name: u.full_name || u.email || u.phone || 'Nomsiz',
      email: u.email || '-',
      phone: u.phone || '-',
      orders: own.length,
      total,
      firstDate: u.created_at,
      banned: u.banned,
    };
  }).sort((a, b) => b.total - a.total);

  const fdate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  const runAction = async (id: string, action: 'ban' | 'unban' | 'delete') => {
    if (action === 'delete' && !confirm("Bu mijoz hisobini butunlay o'chirmoqchimisiz? Buni ortga qaytarib bo'lmaydi.")) return;
    setBusyId(id);
    try {
      if (action === 'ban') await banUser(id);
      else if (action === 'unban') await unbanUser(id);
      else await deleteUser(id);
      reload();
      setToast(action === 'ban' ? 'Mijoz bloklandi' : action === 'unban' ? 'Mijoz blokdan chiqarildi' : "Mijoz o'chirildi");
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      setToast((e as Error).message);
      setTimeout(() => setToast(''), 4000);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-black text-white text-xs font-bold uppercase py-3 px-5 tracking-widest">{toast}</div>}
      <div className="hidden lg:block"><h1 className="text-2xl font-black uppercase tracking-tight">Mijozlar</h1><p className="text-xs text-neutral-400 font-medium">{customers.length} ro'yxatdan o'tgan {customers.length === 1 ? 'mijoz' : 'mijoz'}</p></div>
      <div className="bg-white border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
              <th className="px-5 py-3 text-left">Mijoz</th><th className="px-5 py-3 text-left">Email</th><th className="px-5 py-3 text-left">Telefon</th><th className="px-5 py-3 text-left">Buyurtmalar</th><th className="px-5 py-3 text-left">Jami sarflangan</th><th className="px-5 py-3 text-left">Qo'shilgan</th><th className="px-5 py-3 text-right">Amallar</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-50">
              {loading && <tr><td colSpan={7} className="px-5 py-12 text-center text-neutral-400">Yuklanmoqda...</td></tr>}
              {!loading && customers.map((c) => (<tr key={c.id} className="hover:bg-neutral-50/50">
                <td className="px-5 py-3 font-bold text-black flex items-center gap-2">
                  {c.name}
                  {c.banned && <span className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-600">Bloklangan</span>}
                </td>
                <td className="px-5 py-3 text-neutral-500">{c.email}</td>
                <td className="px-5 py-3 text-neutral-500">{c.phone}</td>
                <td className="px-5 py-3 font-bold text-black">{c.orders}</td>
                <td className="px-5 py-3 font-black text-black">{fmt(c.total)}</td>
                <td className="px-5 py-3 text-neutral-500">{fdate(c.firstDate)}</td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      disabled={busyId === c.id}
                      onClick={() => runAction(c.id, c.banned ? 'unban' : 'ban')}
                      className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 border border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-50"
                    >
                      {c.banned ? 'Blokdan chiqarish' : 'Bloklash'}
                    </button>
                    <button
                      disabled={busyId === c.id}
                      onClick={() => runAction(c.id, 'delete')}
                      className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      O'chirish
                    </button>
                  </div>
                </td>
              </tr>))}
              {!loading && customers.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-neutral-400">Hozircha ro'yxatdan o'tgan mijozlar yo'q</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ======================== ACCOUNTING ========================
const AccountingTab = () => {
  const [txns, setTxns] = useState<Awaited<ReturnType<typeof getTransactions>>>([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getSummary>> | null>(null);
  const reload = () => { getTransactions().then(setTxns); getSummary().then(setSummary); };
  useEffect(() => { reload(); }, []);
  useEffect(() => { if (showModal === false) reload(); }, [showModal]);
  const fdate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  if (!summary) {
    return <div className="text-xs text-neutral-400 font-medium">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-black text-white text-xs font-bold uppercase py-3 px-5 tracking-widest">{toast}</div>}
      <div className="hidden lg:block"><h1 className="text-2xl font-black uppercase tracking-tight">Hisob-kitob</h1><p className="text-xs text-neutral-400 font-medium">Moliyaviy umumiy ko'rinish.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Daromad', value: fmt(summary.total_revenue) },
          { label: 'Xarajatlar', value: fmt(summary.expenses) },
          { label: 'Sof foyda', value: fmt(summary.net_profit) },
          { label: "O'rtacha buyurtma", value: fmt(summary.avg_order) },
        ].map(s => (<div key={s.label} className="bg-white border border-neutral-200 p-4"><span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-1">{s.label}</span><div className="text-lg font-black">{s.value}</div></div>))}
      </div>
      <div className="bg-white border border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <h3 className="text-xs font-black uppercase tracking-wider">Tranzaksiyalar</h3>
          <button onClick={() => setShowModal(true)} className="flex items-center justify-center space-x-2 bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90"><Plus className="w-3.5 h-3.5" /><span>Tranzaksiya qo'shish</span></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
              <th className="px-5 py-3 text-left">ID</th><th className="px-5 py-3 text-left">Turi</th><th className="px-5 py-3 text-left">Kategoriya</th><th className="px-5 py-3 text-left">Miqdori</th><th className="px-5 py-3 text-left">Tavsif</th><th className="px-5 py-3 text-left">Sana</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-50">
              {txns.map(t => (
                <tr key={t.id} className="hover:bg-neutral-50/50">
                  <td className="px-5 py-3 font-bold text-black">{t.id}</td>
                  <td className="px-5 py-3"><span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${t.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{t.type === 'income' ? 'Daromad' : 'Xarajat'}</span></td>
                  <td className="px-5 py-3 text-neutral-600">{t.category}</td>
                  <td className={`px-5 py-3 font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                  <td className="px-5 py-3 text-neutral-600">{t.description}</td>
                  <td className="px-5 py-3 text-neutral-500">{fdate(t.created_at)}</td>
                </tr>
              ))}
              {txns.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-400">Hozircha tranzaksiyalar yo'q</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); setToast("Tranzaksiya qo'shildi"); setTimeout(() => setToast(''), 3000); }} />}
    </div>
  );
};

const TransactionModal = ({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) => {
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'supplies', description: '' });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const handleSave = async () => {
    if (!form.amount) return;
    await addTransaction({ ...form, amount: Number(form.amount) });
    onSaved();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-6"><h2 className="text-sm font-black uppercase tracking-widest">Tranzaksiya qo'shish</h2><button onClick={onClose} className="p-1 text-neutral-400 hover:text-black"><X className="w-5 h-5" /></button></div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Turi</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black"><option value="expense">Xarajat</option><option value="income">Daromad</option></select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Miqdori (baza qiymati, so'mda ko'rsatiladi)</label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Kategoriya</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black"><option value="supplies">Materiallar</option><option value="shipping">Yetkazib berish</option><option value="marketing">Marketing</option><option value="rent">Ijara</option><option value="other">Boshqa</option></select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Tavsif</label>
              <input value={form.description} onChange={e => set('description', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" placeholder="Tavsif" /></div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-100">
          <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">Bekor qilish</button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:opacity-90">Saqlash</button>
        </div>
      </div>
    </div>
  );
};
