import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { translations, type TranslationKey } from '../utils/translations';

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
  createOrder: (customerName?: string) => Order | undefined;
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

const defaultCartItems: CartItem[] = [
  {
    id: 'c1',
    itemId: 'SW-29401',
    name: 'STRUCTURAL WOOL COAT',
    subtitle: 'Carbon Black / SIZE M',
    price: 1250,
    quantity: 1,
    size: 'M',
    color: 'black',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'c6',
    itemId: 'SW-88312',
    name: 'MINIMALIST LEATHER TOTE',
    subtitle: 'Matte Black / SIZE M',
    price: 2100,
    quantity: 1,
    size: 'M',
    color: 'black',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
  },
];

const defaultOrders: Order[] = [
  {
    id: '#ORD-82194',
    orderId: '#ORD-82194',
    customerName: 'Elena Rodriguez',
    customer_name: 'Elena Rodriguez',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    status: 'SHIPPED',
    amount: 492.00,
    total: 492.00,
    timeAgo: '2 mins ago',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    itemsCount: 1,
  },
  {
    id: '#ORD-82193',
    orderId: '#ORD-82193',
    customerName: 'Marcus Chen',
    customer_name: 'Marcus Chen',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    status: 'PROCESSING',
    amount: 1204.50,
    total: 1204.50,
    timeAgo: '15 mins ago',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    itemsCount: 3,
  },
  {
    id: '#ORD-82192',
    orderId: '#ORD-82192',
    customerName: 'Sarah Miller',
    customer_name: 'Sarah Miller',
    customerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
    status: 'PENDING',
    amount: 85.00,
    total: 85.00,
    timeAgo: '1 hour ago',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    itemsCount: 1,
  },
  {
    id: '#ORD-82191',
    orderId: '#ORD-82191',
    customerName: 'Jonathan Wu',
    customer_name: 'Jonathan Wu',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
    status: 'CANCELLED',
    amount: 340.00,
    total: 340.00,
    timeAgo: '1 day ago',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    itemsCount: 2,
  },
];

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>('sayway_cart', defaultCartItems)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage<Order[]>('sayway_orders', defaultOrders)
  );
  const [wishlist, setWishlist] = useState<string[]>(() =>
    loadFromStorage<string[]>('sayway_wishlist', [])
  );
  const [walletBalance, setWalletBalance] = useState<number>(() =>
    loadFromStorage<number>('sayway_wallet', 0)
  );
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Localization and Currency States
  const [lang, setLang] = useState<'EN' | 'RU' | 'UZ'>(() =>
    loadFromStorage<'EN' | 'RU' | 'UZ'>('sayway_lang', 'EN')
  );
  const [currency, setCurrency] = useState<'USD' | 'UZS'>(() =>
    loadFromStorage<'USD' | 'UZS'>('sayway_currency', 'USD')
  );

  useEffect(() => {
    localStorage.setItem('sayway_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('sayway_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sayway_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('sayway_wallet', JSON.stringify(walletBalance));
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

  const createOrder = (customerName = 'Alex Mercer'): Order | undefined => {
    if (cartItems.length === 0) return undefined;

    const ordId = `#ORD-${Math.floor(82195 + Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();

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
      items: [...cartItems],
    };

    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    setLastOrder(newOrder);
    clearCart();
    return newOrder;
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
