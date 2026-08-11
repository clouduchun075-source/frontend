import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { translations, type TranslationKey } from '../utils/translations';
import { useAuth } from './AuthContext';
import { createOrder as createSupabaseOrder, updateOrderStatus as updateSupabaseOrderStatus, getOrdersByUser, type ShippingAddress } from '../data/api';

// How long after placing an order a customer is allowed to self-cancel it.
export const ORDER_CANCEL_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export interface CartItem {
  id: string;
  itemId: string;
  name: string;
  subtitle?: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerName: string;
  customer_name?: string;
  customerEmail?: string;
  customer_email?: string;
  customerAvatar?: string;
  status: 'SHIPPED' | 'PROCESSING' | 'PENDING' | 'CANCELLED' | 'DELIVERED';
  amount: number;
  total?: number;
  timeAgo: string;
  created_at?: string;
  itemsCount: number;
  items?: CartItem[];
  supabaseId?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: Omit<CartItem, 'itemId'>) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, qty: number) => void;
  clearCart: () => void;
  orders: Order[];
  createOrder: (shipping: ShippingAddress) => Promise<Order | undefined>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  lastOrder: Order | null;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  walletBalance: number;
  addToWallet: (amount: number) => void;
  spendWallet: (amount: number) => boolean;
  // Dynamic Localization & Currency Switching
  lang: 'EN' | 'RU' | 'UZ';
  setLang: (lang: 'EN' | 'RU' | 'UZ') => void;
  currency: 'USD' | 'UZS';
  setCurrency: (currency: 'USD' | 'UZS') => void;
  formatPrice: (priceInUSD: number) => string;
  t: (key: TranslationKey) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Each signed-in user (and guests, before signing in) gets their own
  // isolated cart/orders/wishlist/wallet bucket in localStorage, keyed by
  // their Supabase user id. This prevents one account from seeing another
  // account's cart or order history on the same browser.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Guards so that loading a new user's data doesn't immediately
  // overwrite that same data with the (stale) pre-load state.
  const skipSaveRef = useRef({ cart: true, orders: true, wishlist: true, wallet: true });

  const prevScopeRef = useRef<string | null>(null);

  useEffect(() => {
    const scope = user?.id || 'guest';
    const prevScope = prevScopeRef.current;
    skipSaveRef.current = { cart: true, orders: true, wishlist: true, wallet: true };

    let cart = loadFromStorage<CartItem[]>(`sayway_cart_${scope}`, []);
    const ord = loadFromStorage<Order[]>(`sayway_orders_${scope}`, []);
    let wish = loadFromStorage<string[]>(`sayway_wishlist_${scope}`, []);
    const wallet = loadFromStorage<number>(`sayway_wallet_${scope}`, 0);

    // Just signed up/in: carry over whatever was sitting in the guest
    // cart/wishlist so items added before signing up aren't lost.
    if (prevScope === 'guest' && scope !== 'guest') {
      const guestCart = loadFromStorage<CartItem[]>('sayway_cart_guest', []);
      const guestWishlist = loadFromStorage<string[]>('sayway_wishlist_guest', []);
      if (guestCart.length > 0) {
        cart = cart.length > 0 ? [...cart, ...guestCart] : guestCart;
        localStorage.removeItem('sayway_cart_guest');
      }
      if (guestWishlist.length > 0) {
        wish = Array.from(new Set([...wish, ...guestWishlist]));
        localStorage.removeItem('sayway_wishlist_guest');
      }
    }

    setCartItems(cart);
    setOrders(ord);
    setWishlist(wish);
    setWalletBalance(wallet);
    prevScopeRef.current = scope;
  }, [user?.id]);

  // The Admin panel edits order status directly in Supabase, but a signed-in
  // customer's own order list otherwise only lives in localStorage -- so an
  // Admin-side status change (e.g. Processing -> Shipped) would never show
  // up for the customer. Periodically pull the customer's own orders from
  // Supabase and patch just the status field into local state to stay in sync.
  useEffect(() => {
    if (!user?.id) return;

    const syncStatuses = async () => {
      try {
        const remoteOrders = await getOrdersByUser(user.id);
        if (remoteOrders.length === 0) return;
        const statusById = new Map(remoteOrders.map((r) => [r.id, r.status]));
        setOrders((prev) => {
          let changed = false;
          const next = prev.map((o) => {
            const remoteStatus = statusById.get(o.orderId);
            if (remoteStatus && remoteStatus !== o.status) {
              changed = true;
              return { ...o, status: remoteStatus as Order['status'] };
            }
            return o;
          });
          return changed ? next : prev;
        });
      } catch (err) {
        console.error('Failed to sync order statuses from Supabase:', err);
      }
    };

    syncStatuses();
    const interval = setInterval(syncStatuses, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Localization and Currency States (shared across accounts on this device)
  const [lang, setLang] = useState<'EN' | 'RU' | 'UZ'>(() =>
    loadFromStorage<'EN' | 'RU' | 'UZ'>('sayway_lang', 'UZ')
  );
  const [currency, setCurrency] = useState<'USD' | 'UZS'>(() =>
    loadFromStorage<'USD' | 'UZS'>('sayway_currency', 'USD')
  );

  useEffect(() => {
    if (skipSaveRef.current.cart) { skipSaveRef.current.cart = false; return; }
    localStorage.setItem(`sayway_cart_${user?.id || 'guest'}`, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (skipSaveRef.current.orders) { skipSaveRef.current.orders = false; return; }
    localStorage.setItem(`sayway_orders_${user?.id || 'guest'}`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (skipSaveRef.current.wishlist) { skipSaveRef.current.wishlist = false; return; }
    localStorage.setItem(`sayway_wishlist_${user?.id || 'guest'}`, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (skipSaveRef.current.wallet) { skipSaveRef.current.wallet = false; return; }
    localStorage.setItem(`sayway_wallet_${user?.id || 'guest'}`, JSON.stringify(walletBalance));
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('sayway_lang', JSON.stringify(lang));
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sayway_currency', JSON.stringify(currency));
  }, [currency]);

  // Currency Conversion logic: 1 USD = 12,600 UZS (minimalist standard streetwear conversion)
  const formatPrice = (priceInUSD: number): string => {
    if (currency === 'UZS') {
      const priceInUZS = priceInUSD * 12600;
      return priceInUZS.toLocaleString('uz-UZ') + ' UZS';
    }
    return '$' + priceInUSD.toLocaleString('en-US');
  };

  // Dynamic Translation helper
  const t = (key: TranslationKey): string => {
    return translations[lang]?.[key] || translations['EN']?.[key] || key;
  };

  const addToCart = (item: Omit<CartItem, 'itemId'>) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.id === item.id && i.size === item.size
      );

      if (existingIndex > -1) {
        const newItems = prevItems.map((itm, idx) =>
          idx === existingIndex ? { ...itm, quantity: Math.min(itm.quantity + item.quantity, 10) } : itm
        );
        return newItems;
      } else {
        const itemId = `SW-${Math.floor(10000 + Math.random() * 90000)}`;
        return [...prevItems, { ...item, itemId }];
      }
    });
  };

  const removeFromCart = (id: string, size: string) => {
    setCartItems((prevItems) => prevItems.filter((i) => !(i.id === id && i.size === size)));
  };

  const updateQuantity = (id: string, size: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id, size);
      return;
    }
    const clampedQty = Math.min(qty, 10);
    setCartItems((prevItems) =>
      prevItems.map((i) => (i.id === id && i.size === size ? { ...i, quantity: clampedQty } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const createOrder = async (shipping: ShippingAddress): Promise<Order | undefined> => {
    if (cartItems.length === 0) return undefined;

    const customerName = `${shipping.first_name} ${shipping.last_name}`.trim();
    // Generate the order id once and use it for both the local order and the
    // Supabase row, so the customer and Admin panel always see the exact
    // same order number instead of two different generated IDs.
    const ordId = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const nowIso = new Date().toISOString();
    const snapshotItems = [...cartItems];

    // Persist the order (with full delivery details) to Supabase *first* and
    // wait for it, so the local order always has its supabaseId attached
    // before the customer can interact with it (e.g. cancel it right away).
    // Without awaiting this, a fast cancel-right-after-ordering test could
    // race ahead of the sync and never reach the Admin panel.
    let supabaseId: string | undefined;
    try {
      const row = await createSupabaseOrder({
        id: ordId,
        user_id: user?.id ?? null,
        customer_name: customerName,
        customer_email: user?.email || '',
        items: snapshotItems.map((i) => ({
          product_id: i.id, name: i.name, quantity: i.quantity, price: i.price,
          size: i.size, color: i.color, image: i.image,
        })),
        total: cartSubtotal,
        status: 'PROCESSING',
        shipping_address: shipping,
      });
      supabaseId = row?.id;
    } catch (err) {
      console.error('Failed to sync order to Supabase:', err);
    }

    const newOrder: Order = {
      id: ordId,
      orderId: ordId,
      customerName,
      customer_name: customerName,
      customerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100',
      status: 'PROCESSING',
      amount: cartSubtotal,
      total: cartSubtotal,
      timeAgo: 'Just now',
      created_at: nowIso,
      itemsCount: cartCount,
      items: snapshotItems,
      supabaseId,
    };

    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    setLastOrder(newOrder);
    clearCart();
    return newOrder;
  };

  // Customers can cancel their own order within ORDER_CANCEL_WINDOW_MS of
  // placing it. After that, they need to contact an operator instead.
  const cancelOrder = async (orderId: string): Promise<boolean> => {
    const target = orders.find((o) => o.orderId === orderId);
    if (!target) return false;
    if (target.status === 'CANCELLED' || target.status === 'DELIVERED' || target.status === 'SHIPPED') return false;
    const placedAt = target.created_at ? new Date(target.created_at).getTime() : 0;
    if (!placedAt || Date.now() - placedAt > ORDER_CANCEL_WINDOW_MS) return false;

    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status: 'CANCELLED' } : o)));
    if (target.supabaseId) {
      try {
        await updateSupabaseOrderStatus(target.supabaseId, 'CANCELLED');
      } catch (err) {
        console.error('Failed to sync order cancellation to Supabase:', err);
      }
    }
    return true;
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const addToWallet = (amount: number) => {
    if (amount > 0) setWalletBalance((prev) => prev + amount);
  };

  const spendWallet = (amount: number): boolean => {
    if (amount > 0 && walletBalance >= amount) {
      setWalletBalance((prev) => prev - amount);
      return true;
    }
    return false;
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        orders,
        createOrder,
        cancelOrder,
        lastOrder,
        wishlist,
        toggleWishlist,
        isInWishlist,
        walletBalance,
        addToWallet,
        spendWallet,
        lang,
        setLang,
        currency,
        setCurrency,
        formatPrice,
        t,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
