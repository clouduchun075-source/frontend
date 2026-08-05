import { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, Users,
  Plus, Search, ArrowLeft, Folder,
  TrendingUp, Clock, CheckCircle, XCircle,
  Pencil, Trash2, X, LogOut, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getProducts, saveProduct, deleteProduct,
  getOrders, updateOrderStatus,
  getTransactions, addTransaction,
  getSummary
} from '../data/api';
import type { Product } from '../data/api';

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
      setLoginError('Invalid credentials');
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
            <h1 className="text-3xl font-black uppercase tracking-tight">SAYWAY</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Admin Panel</p>
          </div>
          <div className="space-y-4">
            {loginError && <div className="text-xs font-bold text-red-600 bg-red-50 p-3 tracking-wide">{loginError}</div>}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-neutral-50 border border-neutral-200 text-xs px-4 py-3 focus:outline-none focus:border-black font-semibold" placeholder="admin" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-neutral-50 border border-neutral-200 text-xs px-4 py-3 focus:outline-none focus:border-black font-semibold" placeholder="admin123" />
            </div>
            <button onClick={handleLogin} className="w-full bg-black text-white text-xs font-bold uppercase py-4 tracking-widest hover:opacity-90">Sign In</button>
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
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Products', icon: Folder },
    { name: 'Orders', icon: ShoppingBag },
    { name: 'Customers', icon: Users },
    { name: 'Accounting', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="hidden lg:flex w-60 bg-white border-r border-neutral-200 flex-col p-6 fixed h-screen">
        <div className="flex items-center justify-between mb-10">
          <span className="text-xl font-black tracking-tight">SAYWAY</span>
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
                <Icon className="w-4 h-4 stroke-[1.8]" /><span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <button onClick={onBack} className="w-full flex items-center space-x-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">
            <ArrowLeft className="w-4 h-4" /><span>Back to Store</span>
          </button>
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700">
            <LogOut className="w-4 h-4" /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8 lg:ml-60 max-w-6xl">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-2 text-neutral-500 hover:text-black"><ArrowLeft className="w-5 h-5 stroke-[2]" /></button>
            <h1 className="text-lg font-black uppercase tracking-tight">{activeTab}</h1>
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
                <Icon className="w-3.5 h-3.5" /><span>{tab.name}</span>
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

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const statusBadge = (s: string) => {
  if (s === 'SHIPPED' || s === 'DELIVERED') return 'bg-green-50 text-green-700';
  if (s === 'PROCESSING') return 'bg-blue-50 text-blue-700';
  if (s === 'CANCELLED') return 'bg-red-50 text-red-700';
  return 'bg-neutral-100 text-neutral-500';
};

// ======================== DASHBOARD ========================
const DashboardTab = () => {
  const summary = getSummary();
  const orders = getOrders().slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div className="hidden lg:block mb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>
        <p className="text-xs text-neutral-400 font-medium tracking-wide">Your store at a glance.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Revenue', value: fmt(summary.total_revenue), change: `${summary.total_orders} orders`, up: true },
          { label: 'Net Profit', value: fmt(summary.net_profit), change: summary.net_profit >= 0 ? 'Positive' : 'Negative', up: summary.net_profit >= 0 },
          { label: 'Products', value: String(summary.total_products), change: `${summary.low_stock} low stock`, up: summary.low_stock === 0 },
          { label: 'Inventory', value: fmt(summary.total_inventory_value), change: `${summary.total_stock} units`, up: true },
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
          { label: 'Pending', value: summary.pending, icon: Clock },
          { label: 'Completed', value: summary.completed, icon: CheckCircle },
          { label: 'Cancelled', value: summary.cancelled, icon: XCircle },
          { label: 'Avg Order', value: fmt(summary.avg_order), icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="bg-white border border-neutral-200 p-4 flex items-center space-x-3">
            <s.icon className="w-5 h-5 text-neutral-400" />
            <div><div className="text-base font-black">{s.value}</div><span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{s.label}</span></div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-100"><h3 className="text-xs font-black uppercase tracking-wider">Recent Orders</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
              <th className="px-5 py-3 text-left">ID</th><th className="px-5 py-3 text-left">Customer</th><th className="px-5 py-3 text-left">Total</th><th className="px-5 py-3 text-left">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-50">
              {orders.length > 0 ? orders.map(o => {
                const oid = o.id || o.orderId || 'ORD-UNKNOWN';
                const cname = o.customer_name || o.customerName || 'Guest';
                const tot = typeof o.total === 'number' ? o.total : (typeof o.amount === 'number' ? o.amount : 0);
                return (
                  <tr key={oid} className="hover:bg-neutral-50/50">
                    <td className="px-5 py-3.5 font-bold text-black">{oid}</td>
                    <td className="px-5 py-3.5 font-semibold text-neutral-700">{cname}</td>
                    <td className="px-5 py-3.5 font-black text-black">{fmt(tot)}</td>
                    <td className="px-5 py-3.5"><span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${statusBadge(o.status)}`}>{o.status}</span></td>
                  </tr>
                );
              }) : <tr><td colSpan={4} className="px-5 py-8 text-center text-neutral-400">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ======================== PRODUCTS ========================
const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState('');
  const reload = () => setProducts(getProducts());
  useEffect(() => { if (showModal === false) reload(); }, [showModal]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) || p.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (!confirm('Delete this product?')) return;
    deleteProduct(id); reload();
    setToast('Product deleted'); setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-black text-white text-xs font-bold uppercase py-3 px-5 tracking-widest">{toast}</div>}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="hidden lg:block"><h1 className="text-2xl font-black uppercase tracking-tight">Products</h1><p className="text-xs text-neutral-400 font-medium">{products.length} products</p></div>
        <button onClick={() => { setEditProduct(null); setShowModal(true); }} className="flex items-center space-x-2 bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-90">
          <Plus className="w-4 h-4 stroke-[2]" /><span>Add Product</span>
        </button>
      </div>
      <div className="bg-white border border-neutral-200">
        <div className="px-5 py-3 border-b border-neutral-100">
          <div className="relative w-full md:w-72"><input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-4 py-2.5 pr-10 focus:outline-none focus:border-black font-semibold" /><Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400 stroke-[1.5]" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
              <th className="px-5 py-3 text-left">Product</th><th className="px-5 py-3 text-left">Category</th><th className="px-5 py-3 text-left">Price</th><th className="px-5 py-3 text-left">Stock</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50/50">
                  <td className="px-5 py-3"><div className="flex items-center space-x-3"><div className="w-10 h-12 bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0"><img src={p.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div><div><div className="font-bold text-black">{p.name}</div><div className="text-[10px] text-neutral-400">{p.subtitle}</div></div></div></td>
                  <td className="px-5 py-3 text-neutral-600">{p.category}</td>
                  <td className="px-5 py-3 font-black text-black">{fmt(p.price)}</td>
                  <td className="px-5 py-3 font-bold">{p.stock}</td>
                  <td className="px-5 py-3">{p.stock < 10 ? <span className="text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700">Low Stock</span> : <span className="text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-green-50 text-green-700">In Stock</span>}</td>
                  <td className="px-5 py-3 text-right"><div className="flex items-center justify-end space-x-2">
                    <button onClick={() => { setEditProduct(p); setShowModal(true); }} className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-400">No products found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <ProductModal product={editProduct} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); setToast(editProduct ? 'Product updated' : 'Product created'); setTimeout(() => setToast(''), 3000); }} />}
    </div>
  );
};

const ProductModal = ({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) => {
  const [form, setForm] = useState({
    name: product?.name || '', price: String(product?.price || ''), category: product?.category || 'Outerwear',
    brand: product?.brand || 'SAYWAY BLACK LABEL', subtitle: product?.subtitle || '', stock: String(product?.stock || 0),
    tag: product?.tag || '', size: (product?.size || ['M']).join(', '), image: product?.image || '',
    description: product?.description || '', material: product?.material || '', weight: product?.weight || '',
  });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.price) return;
    saveProduct({
      name: form.name, price: Number(form.price), category: form.category, brand: form.brand,
      subtitle: form.subtitle, stock: Number(form.stock), tag: form.tag || null,
      size: form.size.split(',').map(s => s.trim()).filter(Boolean), image: form.image,
      description: form.description, material: form.material, weight: form.weight, color: 'black',
      ...(product ? { id: product.id } : {}),
    });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black uppercase tracking-widest">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-black"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Name</label><input value={form.name} onChange={e => set('name', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Price ($)</label><input type="number" value={form.price} onChange={e => set('price', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black"><option>Outerwear</option><option>Knitwear</option><option>Accessories</option></select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Brand</label>
              <select value={form.brand} onChange={e => set('brand', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black"><option>SAYWAY CORE</option><option>SAYWAY BLACK LABEL</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Subtitle</label><input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Stock</label><input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Tag</label>
              <select value={form.tag} onChange={e => set('tag', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black"><option value="">None</option><option>NEW ARRIVAL</option><option>LIMITED EDITION</option><option>LIMITED</option><option>POPULAR</option></select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Sizes</label><input value={form.size} onChange={e => set('size', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" placeholder="S, M, L" /></div>
          </div>
          <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Image URL</label><input value={form.image} onChange={e => set('image', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
          <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black min-h-[60px] resize-y" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Material</label><input value={form.material} onChange={e => set('material', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Weight</label><input value={form.weight} onChange={e => set('weight', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-100">
          <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:opacity-90">{product ? 'Save Changes' : 'Add Product'}</button>
        </div>
      </div>
    </div>
  );
};

// ======================== ORDERS ========================
const OrdersTab = () => {
  const [orders, setOrders] = useState(getOrders().reverse());
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const reload = () => setOrders(getOrders().reverse());

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatus = (orderId: string, status: string) => {
    updateOrderStatus(orderId, status); reload();
    setToast('Order updated'); setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-black text-white text-xs font-bold uppercase py-3 px-5 tracking-widest">{toast}</div>}
      <div className="hidden lg:block"><h1 className="text-2xl font-black uppercase tracking-tight">Orders</h1><p className="text-xs text-neutral-400 font-medium">{orders.length} orders</p></div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', count: orders.length },
          { label: 'Pending', count: orders.filter(o => o.status === 'PENDING').length },
          { label: 'Processing', count: orders.filter(o => o.status === 'PROCESSING').length },
          { label: 'Shipped', count: orders.filter(o => o.status === 'SHIPPED').length },
          { label: 'Cancelled', count: orders.filter(o => o.status === 'CANCELLED').length },
        ].map(s => (<div key={s.label} className="bg-white border border-neutral-200 p-3 text-center"><div className="text-lg font-black">{s.count}</div><span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{s.label}</span></div>))}
      </div>
      <div className="bg-white border border-neutral-200">
        <div className="px-5 py-3 border-b border-neutral-100"><div className="relative w-full md:w-72"><input type="text" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-4 py-2.5 pr-10 focus:outline-none focus:border-black font-semibold" /><Search className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400 stroke-[1.5]" /></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
              <th className="px-5 py-3 text-left">ID</th><th className="px-5 py-3 text-left">Customer</th><th className="px-5 py-3 text-left">Items</th><th className="px-5 py-3 text-left">Total</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(o => {
                const oid = o.id || o.orderId || 'ORD-UNKNOWN';
                const cname = o.customer_name || o.customerName || 'Guest';
                const tot = typeof o.total === 'number' ? o.total : (typeof o.amount === 'number' ? o.amount : 0);
                return (
                  <tr key={oid} className="hover:bg-neutral-50/50">
                    <td className="px-5 py-3 font-bold text-black">{oid}</td>
                    <td className="px-5 py-3 font-semibold text-neutral-700">{cname}</td>
                    <td className="px-5 py-3">{o.items?.length || 0}</td>
                    <td className="px-5 py-3 font-black text-black">{fmt(tot)}</td>
                    <td className="px-5 py-3"><span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${statusBadge(o.status)}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-right">
                      <select value={o.status} onChange={e => handleStatus(oid, e.target.value)} className="text-[10px] font-bold uppercase tracking-wider border border-neutral-200 px-2 py-1.5 bg-white cursor-pointer focus:outline-none focus:border-black">
                        <option value="PENDING">Pending</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-400">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ======================== CUSTOMERS ========================
const CustomersTab = () => {
  const orders = getOrders();
  const map = new Map<string, { name: string; email: string; orders: number; total: number; firstDate: string }>();
  orders.forEach(o => {
    const key = o.customer_email || o.customer_name;
    const ex = map.get(key);
    if (ex) { ex.orders += 1; ex.total += o.total; }
    else map.set(key, { name: o.customer_name, email: o.customer_email, orders: 1, total: o.total, firstDate: o.created_at });
  });
  const customers = Array.from(map.values()).sort((a, b) => b.total - a.total);
  const fdate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  return (
    <div className="space-y-6">
      <div className="hidden lg:block"><h1 className="text-2xl font-black uppercase tracking-tight">Customers</h1><p className="text-xs text-neutral-400 font-medium">{customers.length} unique customers</p></div>
      <div className="bg-white border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
              <th className="px-5 py-3 text-left">Customer</th><th className="px-5 py-3 text-left">Email</th><th className="px-5 py-3 text-left">Orders</th><th className="px-5 py-3 text-left">Total Spent</th><th className="px-5 py-3 text-left">First Order</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-50">
              {customers.map((c, i) => (<tr key={i} className="hover:bg-neutral-50/50">
                <td className="px-5 py-3 font-bold text-black">{c.name}</td>
                <td className="px-5 py-3 text-neutral-500">{c.email || '-'}</td>
                <td className="px-5 py-3 font-bold text-black">{c.orders}</td>
                <td className="px-5 py-3 font-black text-black">{fmt(c.total)}</td>
                <td className="px-5 py-3 text-neutral-500">{fdate(c.firstDate)}</td>
              </tr>))}
              {customers.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-neutral-400">No customers yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ======================== ACCOUNTING ========================
const AccountingTab = () => {
  const [txns, setTxns] = useState(getTransactions().reverse());
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const summary = getSummary();
  const reload = () => setTxns(getTransactions().reverse());
  useEffect(() => { if (showModal === false) reload(); }, [showModal]);
  const fdate = (iso: string) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-50 bg-black text-white text-xs font-bold uppercase py-3 px-5 tracking-widest">{toast}</div>}
      <div className="hidden lg:block"><h1 className="text-2xl font-black uppercase tracking-tight">Accounting</h1><p className="text-xs text-neutral-400 font-medium">Financial overview.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Revenue', value: fmt(summary.total_revenue) },
          { label: 'Expenses', value: fmt(summary.expenses) },
          { label: 'Net Profit', value: fmt(summary.net_profit) },
          { label: 'Avg Order', value: fmt(summary.avg_order) },
        ].map(s => (<div key={s.label} className="bg-white border border-neutral-200 p-4"><span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-1">{s.label}</span><div className="text-lg font-black">{s.value}</div></div>))}
      </div>
      <div className="bg-white border border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-wider">Transactions</h3>
          <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 bg-black text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:opacity-90"><Plus className="w-3.5 h-3.5" /><span>Add Transaction</span></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 border-b border-neutral-100">
              <th className="px-5 py-3 text-left">ID</th><th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-left">Category</th><th className="px-5 py-3 text-left">Amount</th><th className="px-5 py-3 text-left">Description</th><th className="px-5 py-3 text-left">Date</th>
            </tr></thead>
            <tbody className="divide-y divide-neutral-50">
              {txns.map(t => (
                <tr key={t.id} className="hover:bg-neutral-50/50">
                  <td className="px-5 py-3 font-bold text-black">{t.id}</td>
                  <td className="px-5 py-3"><span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full ${t.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{t.type}</span></td>
                  <td className="px-5 py-3 text-neutral-600">{t.category}</td>
                  <td className={`px-5 py-3 font-black ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}{fmt(t.amount)}</td>
                  <td className="px-5 py-3 text-neutral-600">{t.description}</td>
                  <td className="px-5 py-3 text-neutral-500">{fdate(t.created_at)}</td>
                </tr>
              ))}
              {txns.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-neutral-400">No transactions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); setToast('Transaction added'); setTimeout(() => setToast(''), 3000); }} />}
    </div>
  );
};

const TransactionModal = ({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) => {
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'supplies', description: '' });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const handleSave = () => {
    if (!form.amount) return;
    addTransaction({ ...form, amount: Number(form.amount) });
    onSaved();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md p-6 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-6"><h2 className="text-sm font-black uppercase tracking-widest">Add Transaction</h2><button onClick={onClose} className="p-1 text-neutral-400 hover:text-black"><X className="w-5 h-5" /></button></div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black"><option value="expense">Expense</option><option value="income">Income</option></select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Amount ($)</label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black"><option value="supplies">Supplies</option><option value="shipping">Shipping</option><option value="marketing">Marketing</option><option value="rent">Rent</option><option value="other">Other</option></select></div>
            <div className="space-y-1"><label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Description</label>
              <input value={form.description} onChange={e => set('description', e.target.value)} className="w-full bg-neutral-50 border border-neutral-200 text-xs px-3 py-2.5 focus:outline-none focus:border-black" placeholder="Description" /></div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-neutral-100">
          <button onClick={onClose} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:opacity-90">Save</button>
        </div>
      </div>
    </div>
  );
};
