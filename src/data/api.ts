export interface Product {
  id: string;
  name: string; // Dynamically localized on-the-fly via t('prod_${id}_name')
  price: number;
  priceLabel?: string;
  category: string;
  brand: string;
  color: string;
  size: string[];
  tag: string | null;
  subtitle: string; // Dynamically localized on-the-fly via t('prod_${id}_subtitle')
  image: string;
  description: string; // Dynamically localized on-the-fly via t('prod_${id}_desc')
  material: string;
  weight: string;
  stock: number;
  images?: string[];
  discount?: number;
  rating?: number;
}

export interface Order {
  id: string;
  orderId?: string;
  customer_name: string;
  customerName?: string;
  customer_email: string;
  customerEmail?: string;
  items: { product_id?: string; id?: string; name: string; quantity: number; price: number }[];
  total: number;
  amount?: number;
  status: string;
  payment_method?: string;
  created_at: string;
  timeAgo?: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  created_at: string;
}

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key);
    if (s) return JSON.parse(s);
  } catch {}
  return fallback;
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(prefix: string) {
  return prefix + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ---- PRODUCTS ----
const DEFAULT_PRODUCTS: Product[] = [
  { id:'c1',name:'Structural Wool Coat',price:1250,category:'Outerwear',brand:'SAYWAY BLACK LABEL',color:'black',size:['S','M','L'],tag:'NEW ARRIVAL',subtitle:'Carbon Black',image:'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600',description:'Crafted from premium architectural-grade wool.',material:'100% Virgin Wool',weight:'680 GSM',stock:15,rating:4.8 },
  { id:'c2',name:'Architectural Knit',price:890,category:'Knitwear',brand:'SAYWAY CORE',color:'white',size:['M','L','XL'],tag:null,subtitle:'Bone White',image:'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600',description:'A structural knit piece.',material:'80% Merino Wool, 20% Cashmere',weight:'420 GSM',stock:0,rating:4.2 },
  { id:'c3',name:'Pleated Trousers',price:540,category:'Outerwear',brand:'SAYWAY BLACK LABEL',color:'lightgray',size:['XS','S','M'],tag:null,subtitle:'Slate Gray',image:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600',description:'Precision-cut pleated trousers.',material:'97% Organic Cotton, 3% Elastane',weight:'320 GSM',stock:25,discount:20,rating:4.5 },
  { id:'c4',name:'Technical Shell',price:920,category:'Outerwear',brand:'SAYWAY BLACK LABEL',color:'darkgray',size:['S','M','XL'],tag:'LIMITED EDITION',subtitle:'Midnight',image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600',description:'High-performance technical shell jacket.',material:'100% Nylon Ripstop',weight:'280 GSM',stock:8,discount:15,rating:4.9 },
  { id:'c5',name:'Essential Heavyweight Tee',price:180,category:'Accessories',brand:'SAYWAY CORE',color:'white',size:['XS','S','M','L','XL'],tag:null,subtitle:'Optic White',image:'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',description:'The foundation of any premium wardrobe.',material:'100% Organic Cotton',weight:'300 GSM',stock:100,rating:4.6 },
  { id:'c6',name:'Minimalist Leather Tote',price:2100,category:'Accessories',brand:'SAYWAY BLACK LABEL',color:'black',size:['M'],tag:null,subtitle:'Matte Black',image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',description:'Handcrafted from Italian full-grain leather.',material:'Full-Grain Italian Leather',weight:'N/A',stock:5,rating:5.0 },
  { id:'c7',name:'Monolith Blazer',price:680,category:'Outerwear',brand:'SAYWAY BLACK LABEL',color:'black',size:['S','M','L'],tag:null,subtitle:'Onyx Black',image:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',description:'A structured blazer with architectural shoulders.',material:'95% Wool, 5% Elastane',weight:'380 GSM',stock:0,discount:10,rating:4.4 },
  { id:'c8',name:'Premium Oversize Hoodie',price:120,category:'Knitwear',brand:'SAYWAY CORE',color:'black',size:['XS','S','M','L','XL','XXL'],tag:'NEW ARRIVAL',subtitle:'Carbon Black',image:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',description:'Crafted from architectural-grade heavyweight cotton.',material:'100% Organic Cotton',weight:'450 GSM',stock:45,rating:4.7 },
  { id:'c9',name:'Geometric Tote',price:315,category:'Accessories',brand:'SAYWAY BLACK LABEL',color:'black',size:['OS'],tag:'LIMITED',subtitle:'Matte Black',image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',description:'Geometric-structured tote.',material:'Vegan Leather',weight:'N/A',stock:3,discount:25,rating:4.3 },
  { id:'c10',name:'Pleated Technical Pant',price:195,category:'Outerwear',brand:'SAYWAY CORE',color:'lightgray',size:['S','M','L'],tag:null,subtitle:'Stone Grey',image:'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600',description:'Technical pleated pant.',material:'95% Nylon, 5% Elastane',weight:'240 GSM',stock:12,rating:4.1 },
  { id:'c11',name:'Linear Turtle Neck',price:210,category:'Knitwear',brand:'SAYWAY CORE',color:'white',size:['XS','S','M'],tag:null,subtitle:'Pristine White',image:'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&q=80&w=600',description:'A refined turtleneck.',material:'70% Merino Wool, 30% Silk',weight:'280 GSM',stock:0,rating:4.5 },
  { id:'c12',name:'Cashmere Overcoat',price:520,category:'Outerwear',brand:'SAYWAY BLACK LABEL',color:'black',size:['S','M','L','XL'],tag:'POPULAR',subtitle:'Deep Black',image:'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',description:'Luxurious cashmere overcoat.',material:'100% Mongolian Cashmere',weight:'550 GSM',stock:18,rating:4.9 },
];

export function getProducts(): Product[] {
  const products = load<Product[] | null>('sayway_products', null);
  if (!products) { save('sayway_products', DEFAULT_PRODUCTS); return DEFAULT_PRODUCTS; }
  // Check if we need to migrate/upgrade localStorage products to have discount and rating fields
  let updated = false;
  const migrated = products.map(p => {
    const orig = DEFAULT_PRODUCTS.find(o => o.id === p.id);
    if (orig) {
      if (p.discount === undefined && orig.discount !== undefined) { p.discount = orig.discount; updated = true; }
      if (p.rating === undefined && orig.rating !== undefined) { p.rating = orig.rating; updated = true; }
      if (p.stock !== orig.stock && p.stock === undefined) { p.stock = orig.stock; updated = true; }
    }
    return p;
  });
  if (updated) { save('sayway_products', migrated); return migrated; }
  return products;
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find(p => p.id === id);
}

export function saveProduct(data: Omit<Product, 'id'> & { id?: string }): Product {
  const products = getProducts();
  if (data.id) {
    const idx = products.findIndex(p => p.id === data.id);
    if (idx >= 0) { products[idx] = { ...products[idx], ...data } as Product; }
    else { products.push(data as Product); }
  } else {
    const p = { ...data, id: uid('c') } as Product;
    products.push(p);
  }
  save('sayway_products', products);
  return data as Product;
}

export function deleteProduct(id: string) {
  save('sayway_products', getProducts().filter(p => p.id !== id));
}

// ---- ORDERS ----
export function getOrders(): Order[] {
  return load<Order[]>('sayway_orders', []);
}

export function createOrder(data: Omit<Order, 'id' | 'created_at'>): Order {
  const order: Order = { ...data, id: uid('ORD-'), created_at: new Date().toISOString() };
  const orders = getOrders();
  orders.push(order);
  save('sayway_orders', orders);
  const products = getProducts();
  order.items.forEach(item => {
    const p = products.find(pr => pr.id === (item.product_id || item.id));
    if (p) p.stock = Math.max(0, p.stock - item.quantity);
  });
  save('sayway_products', products);
  return order;
}

export function updateOrderStatus(orderId: string, status: string) {
  const orders = getOrders();
  const o = orders.find(or => or.id === orderId);
  if (o) o.status = status;
  save('sayway_orders', orders);
}

// ---- ACCOUNTING ----
export function getTransactions(): Transaction[] {
  return load<Transaction[]>('sayway_transactions', []);
}

export function addTransaction(data: Omit<Transaction, 'id' | 'created_at'>): Transaction {
  const txn: Transaction = { ...data, id: uid('TXN-'), created_at: new Date().toISOString() };
  const txns = getTransactions();
  txns.push(txn);
  save('sayway_transactions', txns);
  return txn;
}

export function getSummary() {
  const rawOrders = getOrders();
  const orders = rawOrders.map(o => ({
    ...o,
    id: o.id || o.orderId || 'ORD-UNKNOWN',
    customer_name: o.customer_name || o.customerName || 'Guest',
    total: typeof o.total === 'number' ? o.total : (typeof o.amount === 'number' ? o.amount : 0),
  }));
  const products = getProducts();
  const txns = getTransactions();
  const total_revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const total_stock = products.reduce((s, p) => s + p.stock, 0);
  const total_inventory_value = products.reduce((s, p) => s + p.stock * p.price, 0);
  return {
    total_revenue, total_orders: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    completed: orders.filter(o => o.status === 'SHIPPED' || o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    expenses, net_profit: total_revenue - expenses,
    total_products: products.length, total_stock,
    low_stock: products.filter(p => p.stock < 10).length,
    total_inventory_value,
    avg_order: orders.length ? total_revenue / orders.length : 0,
  };
}
