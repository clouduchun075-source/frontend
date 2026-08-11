import { supabase } from '../lib/supabase';

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
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  house_number: string;
  postal_code?: string;
}

export interface SavedAddress extends ShippingAddress {
  id: string;
  user_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  orderId?: string;
  user_id?: string | null;
  customer_name: string;
  customerName?: string;
  customer_email: string;
  customerEmail?: string;
  items: { product_id?: string; id?: string; name: string; quantity: number; price: number; size?: string; color?: string; image?: string }[];
  total: number;
  amount?: number;
  status: string;
  payment_method?: string;
  shipping_address?: ShippingAddress | null;
  created_at: string;
  timeAgo?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  created_at: string;
}

function uid(prefix: string) {
  return prefix + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Map a Supabase products row (snake_case) to the app's Product shape
function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    priceLabel: row.price_label ?? undefined,
    category: row.category,
    brand: row.brand,
    color: row.color,
    size: row.size ?? [],
    tag: row.tag,
    subtitle: row.subtitle,
    image: row.image,
    description: row.description,
    material: row.material,
    weight: row.weight,
    stock: row.stock,
    images: row.images ?? undefined,
    discount: row.discount ?? undefined,
  };
}

function productToRow(data: Partial<Product>) {
  return {
    name: data.name,
    price: data.price,
    price_label: data.priceLabel,
    category: data.category,
    brand: data.brand,
    color: data.color,
    size: data.size,
    tag: data.tag,
    subtitle: data.subtitle,
    image: data.image,
    description: data.description,
    material: data.material,
    weight: data.weight,
    stock: data.stock,
    images: data.images,
    discount: data.discount,
  };
}

// ---- PRODUCTS ----
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('getProducts error:', error);
    return [];
  }
  return (data ?? []).map(rowToProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('getProductById error:', error);
    return undefined;
  }
  return data ? rowToProduct(data) : undefined;
}

export async function saveProduct(data: Omit<Product, 'id'> & { id?: string }): Promise<Product | null> {
  const id = data.id || uid('c');
  const { data: row, error } = await supabase
    .from('products')
    .upsert({ id, ...productToRow(data) })
    .select()
    .single();
  if (error) {
    console.error('saveProduct error:', error);
    return null;
  }
  return rowToProduct(row);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) console.error('deleteProduct error:', error);
}

// Uploads a product photo (dragged/selected in the Admin panel) to the
// public `product-images` Storage bucket and returns its public URL.
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${uid('img-').toLowerCase()}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

// ---- SAVED ADDRESSES ----
export async function getAddresses(): Promise<SavedAddress[]> {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getAddresses error:', error);
    return [];
  }
  return data ?? [];
}

export async function saveAddress(userId: string, address: ShippingAddress): Promise<SavedAddress | null> {
  const { data, error } = await supabase
    .from('addresses')
    .insert({ user_id: userId, ...address })
    .select()
    .single();
  if (error) {
    console.error('saveAddress error:', error);
    return null;
  }
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) console.error('deleteAddress error:', error);
}

// ---- PROFILES (registered users) ----
export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getProfiles error:', error);
    return [];
  }
  return data ?? [];
}

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function callEdgeFunction(name: string, body: unknown) {
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  created_at: string;
  banned: boolean;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const data = await callEdgeFunction('admin-list-users', {});
  return data.users ?? [];
}

export async function banUser(userId: string): Promise<void> {
  await callEdgeFunction('admin-manage-user', { action: 'ban', userId });
}

export async function unbanUser(userId: string): Promise<void> {
  await callEdgeFunction('admin-manage-user', { action: 'unban', userId });
}

export async function deleteUser(userId: string): Promise<void> {
  await callEdgeFunction('admin-manage-user', { action: 'delete', userId });
}

// Tells the customer about their order's current status via the Telegram
// bot they verified their phone with. Throws if they haven't linked
// Telegram yet or the order has no phone on file.
export async function notifyOrderStatus(orderId: string): Promise<void> {
  await callEdgeFunction('notify-order-status', { orderId });
}

// ---- ORDERS ----
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getOrders error:', error);
    return [];
  }
  return data ?? [];
}

// Orders belonging to one signed-in customer -- used by the storefront to
// keep the customer's own order statuses in sync with whatever the Admin
// panel has set (Admin edits status directly in Supabase, but the
// customer's copy of their orders otherwise only lives in localStorage).
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getOrdersByUser error:', error);
    return [];
  }
  return data ?? [];
}

export async function createOrder(data: Omit<Order, 'id' | 'created_at'> & { id?: string }): Promise<Order | null> {
  // Accept a caller-provided id so the storefront and Admin panel always
  // show the exact same order number for the same order, instead of the
  // customer seeing one ID locally and Admin seeing a different generated one.
  const order = { ...data, id: data.id || uid('ORD-') };
  const { data: row, error } = await supabase.from('orders').insert(order).select().single();
  if (error) {
    console.error('createOrder error:', error);
    return null;
  }

  // Decrement stock for each purchased product
  for (const item of order.items) {
    const productId = item.product_id || item.id;
    if (!productId) continue;
    const product = await getProductById(productId);
    if (product) {
      await supabase
        .from('products')
        .update({ stock: Math.max(0, product.stock - item.quantity) })
        .eq('id', productId);
    }
  }

  return row as Order;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) console.error('updateOrderStatus error:', error);
}

// ---- ACCOUNTING ----
export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('getTransactions error:', error);
    return [];
  }
  return data ?? [];
}

export async function addTransaction(data: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> {
  const txn = { ...data, id: uid('TXN-') };
  const { data: row, error } = await supabase.from('transactions').insert(txn).select().single();
  if (error) {
    console.error('addTransaction error:', error);
    return null;
  }
  return row as Transaction;
}

export async function getSummary() {
  const [rawOrders, products, txns] = await Promise.all([
    getOrders(),
    getProducts(),
    getTransactions(),
  ]);

  const orders = rawOrders.map(o => ({
    ...o,
    id: o.id || o.orderId || 'ORD-UNKNOWN',
    customer_name: o.customer_name || o.customerName || 'Guest',
    total: typeof o.total === 'number' ? o.total : (typeof o.amount === 'number' ? o.amount : 0),
  }));

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
