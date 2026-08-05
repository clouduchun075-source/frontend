import { useState, useEffect } from 'react';
import { User, Package, Heart, Settings, LogOut, ChevronRight, Mail, Phone } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProducts } from '../data/api';
import type { Product } from '../data/api';
import { ProductCard } from '../components/ProductCard';

export const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, cartCount, wishlist, formatPrice } = useCart();
  const [activeSection, setActiveSection] = useState<'overview' | 'orders' | 'wishlist' | 'settings'>('overview');
  const [emailNotif, setEmailNotif] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    } else if (tab === 'overview') {
      setActiveSection('overview');
    }
  }, [location]);

  const userInfo = {
    name: 'Alex Mercer',
    email: 'alex@sayway.com',
    phone: '+1 (555) 012-3456',
    address: '123 Fashion Ave, New York, NY 10001',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    memberSince: 'January 2024',
    memberTier: 'BLACK LABEL',
  };

  const menuItems = [
    { id: 'overview' as const, label: 'Overview', icon: User },
    { id: 'orders' as const, label: 'My Orders', icon: Package },
    { id: 'wishlist' as const, label: 'Wishlist', icon: Heart },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  const [allProductsList, setAllProductsList] = useState<Product[]>([]);

  useEffect(() => {
    setAllProductsList(getProducts());
  }, [wishlist]); // Reload when wishlist modifications happen to sync lists

  const wishlistProducts = allProductsList.filter((p) => wishlist.includes(p.id));

  const handleSave = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-black dark:text-white pb-20 md:pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {showSaveToast && (
          <div className="fixed top-20 right-4 md:right-8 z-50 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase py-4 px-6 tracking-widest flex items-center space-x-3 shadow-2xl animate-slide-in">
            <span>Changes saved successfully</span>
          </div>
        )}

        {showSignOutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSignOutConfirm(false)} />
            <div className="relative bg-white dark:bg-neutral-950 p-6 md:p-8 max-w-sm w-full mx-4 shadow-2xl z-10 text-center border border-neutral-100 dark:border-neutral-805 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Sign Out?</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Are you sure you want to sign out of your account?</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSignOutConfirm(false)} className="flex-1 border border-neutral-200 dark:border-neutral-750 py-3 text-xs font-bold uppercase tracking-widest text-black dark:text-white hover:border-neutral-400 dark:hover:border-neutral-550 transition-colors">
                  Cancel
                </button>
                <button onClick={() => { setShowSignOutConfirm(false); navigate('/'); }} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors">
                  Sign Out
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
              <h3 className="text-sm font-black uppercase tracking-widest text-red-650 dark:text-red-400">Delete Account?</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">This action is permanent and cannot be undone. All your data, orders, and history will be deleted.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-neutral-200 dark:border-neutral-750 py-3 text-xs font-bold uppercase tracking-widest text-black dark:text-white hover:border-neutral-400 dark:hover:border-neutral-550 transition-colors">
                  Cancel
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); navigate('/'); }} className="flex-1 bg-red-600 text-white py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors">
                  Delete
                </button>
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
                <span>Sign Out</span>
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
                  Dashboard Overview
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-neutral-200 dark:border-neutral-800 p-4 text-center space-y-1 bg-white dark:bg-neutral-950">
                    <span className="text-2xl font-black text-black dark:text-white">{orders.length}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">Total Orders</span>
                  </div>
                  <div className="border border-neutral-200 dark:border-neutral-800 p-4 text-center space-y-1 bg-white dark:bg-neutral-950">
                    <span className="text-2xl font-black text-black dark:text-white">{cartCount}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">In Bag</span>
                  </div>
                  <div className="border border-neutral-200 dark:border-neutral-800 p-4 text-center space-y-1 bg-white dark:bg-neutral-950">
                    <span className="text-2xl font-black text-black dark:text-white">{wishlist.length}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 block">Wishlist</span>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 text-left">Recent Orders</h4>
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
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium py-4 text-center">No orders yet</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link to="/collections" className="flex-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase py-3.5 tracking-widest text-center hover:opacity-90">
                    Shop Now
                  </Link>
                  <Link to="/bag" className="flex-1 border border-neutral-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold uppercase py-3.5 tracking-widest text-center hover:border-neutral-400 dark:hover:border-neutral-550">
                    View Bag ({cartCount})
                  </Link>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeSection === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">My Orders</h3>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest">{orders.length} orders</span>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div key={ord.orderId} className="border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-950 transition-colors">
                        <div className="flex items-center space-x-4">
                          {ord.customerAvatar && (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-750 flex-shrink-0">
                              <img src={ord.customerAvatar} alt="" className="w-full h-full object-cover grayscale" />
                            </div>
                          )}
                          <div className="space-y-0.5 text-left">
                            <span className="text-sm font-bold text-black dark:text-white block">{ord.orderId}</span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">{ord.timeAgo} &bull; {ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 justify-between md:justify-end">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                            ord.status === 'SHIPPED' || ord.status === 'DELIVERED' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-455' :
                            ord.status === 'PROCESSING' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-455' :
                            ord.status === 'PENDING' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400' :
                            'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                          }`}>
                            {ord.status}
                          </span>
                          <span className="text-sm font-black text-black dark:text-white">
                            {formatPrice(ord.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 transition-colors">
                    <Package className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto" />
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">No orders yet</p>
                    <Link to="/collections" className="inline-block bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase px-6 py-3 tracking-widest hover:opacity-90">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Section */}
            {activeSection === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">My Wishlist</h3>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-widest">{wishlistProducts.length} items</span>
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
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Your wishlist is empty</p>
                    <Link to="/collections" className="inline-block bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase px-6 py-3 tracking-widest hover:opacity-90">
                      Browse Collections
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800 pb-3 text-black dark:text-white">
                  Account Settings
                </h3>

                <div className="space-y-4">
                  <div className="border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 bg-white dark:bg-neutral-950 transition-colors">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Personal Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Full Name</label>
                        <input type="text" defaultValue={userInfo.name} className="w-full border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-black dark:text-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black dark:focus:border-white" />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Email</label>
                        <input type="email" defaultValue={userInfo.email} className="w-full border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-black dark:text-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black dark:focus:border-white" />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Phone</label>
                        <input type="tel" defaultValue={userInfo.phone} className="w-full border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-black dark:text-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black dark:focus:border-white" />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Address</label>
                        <input type="text" defaultValue={userInfo.address} className="w-full border border-neutral-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-black dark:text-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black dark:focus:border-white" />
                      </div>
                    </div>
                    <button onClick={handleSave} className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase px-6 py-3 tracking-widest hover:opacity-90 transition-colors focus:outline-none">
                      Save Changes
                    </button>
                  </div>

                  <div className="border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 bg-white dark:bg-neutral-950 transition-colors">
                    <h4 className="text-xs font-black uppercase tracking-widest text-black dark:text-white text-left">Notifications</h4>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-neutral-750 dark:text-neutral-300">Email notifications for orders</span>
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
                      <span className="text-xs font-semibold text-neutral-750 dark:text-neutral-300">Marketing emails</span>
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
                    <h4 className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-2 text-left">Danger Zone</h4>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mb-3 text-left">Permanently delete your account and all associated data.</p>
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="border border-red-300 dark:border-red-900/50 text-red-650 dark:text-red-400 text-[10px] font-bold uppercase px-5 py-2.5 tracking-widest hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors focus:outline-none"
                    >
                      Delete Account
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
