import { apiFetch } from "@/lib/api-client";

// The Medical Store domain: a user registers a store, adds medicines to it
// (each becomes a "store product" with its own buy/sale/wholesale price),
// logs stock transactions (purchase/sale/return/adjustment) against each
// store product, and — via the Order API below — sells them through a POS.
//
// Response schema panels for every endpoint below render as a bare
// `data: string` (the same collapsed-schema doc-generation quirk seen
// throughout this API) — no real response sample was available to double
// check, so these follow the standard `{ data: Resource }` convention used
// everywhere else already confirmed in this API.

export interface StoreOwner {
  id: number;
  name: string;
  phone: string | null;
}

export interface StoreRecord {
  id: number;
  user_id: number;
  store_name: string;
  store_address: string;
  trade_license_no: string;
  phone: string | null;
  email: string | null;
  description: string | null;
  is_active: boolean;
  owner?: StoreOwner;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StorePayload {
  store_name: string;
  store_address: string;
  trade_license_no: string;
  phone?: string;
  email?: string;
  description?: string;
}

// No "my-stores" endpoint exists — GET /stores (Bearer auth) is used
// directly, on the same assumption already proven correct for ambulances:
// scoped to what the authenticated caller can manage (their own store(s)
// for a regular user, every store for an admin).
export async function fetchStores(token: string): Promise<{ stores: StoreRecord[]; failed: boolean }> {
  try {
    const res = await apiFetch<{ data: StoreRecord[] }>("/stores", { token });
    return { stores: res?.data ?? [], failed: false };
  } catch {
    return { stores: [], failed: true };
  }
}

export async function fetchStore(token: string, id: number | string): Promise<StoreRecord | null> {
  try {
    const res = await apiFetch<{ data: StoreRecord }>(`/stores/${id}`, { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export async function createStore(token: string, payload: StorePayload): Promise<StoreRecord> {
  const res = await apiFetch<{ message: string; data: StoreRecord }>("/stores", {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

export async function updateStore(token: string, id: number | string, payload: StorePayload): Promise<StoreRecord> {
  const res = await apiFetch<{ message: string; data: StoreRecord }>(`/stores/${id}`, {
    method: "PUT",
    token,
    body: payload,
  });
  return res.data;
}

export async function deleteStore(token: string, id: number | string): Promise<void> {
  await apiFetch<{ message: string }>(`/stores/${id}`, { method: "DELETE", token });
}

// --- Store Products (a medicine listed for sale at a specific store) ---

export interface StoreProductRecord {
  id: number;
  store_id: number;
  medicine_id: number;
  medicine_name?: string | null;
  medicine_generic_name?: string | null;
  buy_price: number;
  sale_price: number;
  wholesale_price: number;
  minimum_stock: number | null;
  is_active: boolean;
  // Present directly on products.index/show per the docs — no separate
  // fetch needed just to show current stock in a product list.
  current_stock?: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StoreProductPayload {
  medicine_id: number;
  buy_price: number;
  sale_price: number;
  wholesale_price: number;
  minimum_stock?: number;
  is_active?: boolean;
}

export async function fetchStoreProducts(
  token: string,
  storeId: number | string
): Promise<{ products: StoreProductRecord[]; failed: boolean }> {
  try {
    const res = await apiFetch<{ data: StoreProductRecord[] }>(`/stores/${storeId}/products`, { token });
    return { products: res?.data ?? [], failed: false };
  } catch {
    return { products: [], failed: true };
  }
}

export async function createStoreProduct(
  token: string,
  storeId: number | string,
  payload: StoreProductPayload
): Promise<StoreProductRecord> {
  const res = await apiFetch<{ message: string; data: StoreProductRecord }>(`/stores/${storeId}/products`, {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

export async function updateStoreProduct(
  token: string,
  storeId: number | string,
  productId: number | string,
  payload: StoreProductPayload
): Promise<StoreProductRecord> {
  const res = await apiFetch<{ message: string; data: StoreProductRecord }>(
    `/stores/${storeId}/products/${productId}`,
    { method: "PUT", token, body: payload }
  );
  return res.data;
}

export async function deleteStoreProduct(
  token: string,
  storeId: number | string,
  productId: number | string
): Promise<void> {
  await apiFetch<{ message: string }>(`/stores/${storeId}/products/${productId}`, {
    method: "DELETE",
    token,
  });
}

// --- Store Stock (a single purchase/sale/return/adjustment transaction) ---

export type StockTransactionType = "purchase" | "sale" | "return" | "adjustment";

export const STOCK_TRANSACTION_TYPES: { value: StockTransactionType; label: string }[] = [
  { value: "purchase", label: "Purchase (stock in)" },
  { value: "sale", label: "Sale (stock out)" },
  { value: "return", label: "Return" },
  { value: "adjustment", label: "Adjustment" },
];

export interface StoreStockRecord {
  id: number;
  store_product_id: number;
  quantity: number;
  transaction_type: StockTransactionType;
  unit_price: number;
  total_price: number;
  remarks: string | null;
  transaction_date: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StoreStockPayload {
  store_product_id: number;
  quantity: number;
  transaction_type: StockTransactionType;
  unit_price: number;
  remarks?: string;
  transaction_date: string; // ISO date-time
}

export async function fetchStoreStocks(
  token: string,
  storeId: number | string
): Promise<{ stocks: StoreStockRecord[]; failed: boolean }> {
  try {
    const res = await apiFetch<{ data: StoreStockRecord[] }>(`/stores/${storeId}/stocks`, { token });
    return { stocks: res?.data ?? [], failed: false };
  } catch {
    return { stocks: [], failed: true };
  }
}

export async function createStoreStock(
  token: string,
  storeId: number | string,
  payload: StoreStockPayload
): Promise<StoreStockRecord> {
  const res = await apiFetch<{ message: string; data: StoreStockRecord }>(`/stores/${storeId}/stocks`, {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

// --- Orders (POS checkout) ---

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export interface OrderItemPayload {
  store_product_id: number;
  quantity: number;
}

export interface OrderPayload {
  customer_id?: number;
  shipping_address?: string;
  payment_method?: string;
  discount?: number;
  delivery_fee?: number;
  notes?: string;
  items: OrderItemPayload[];
}

// The docs' response schema collapses `items` to a bare string on every
// order endpoint (the same broken-schema quirk as elsewhere) — no real
// sample was available for the array's actual shape, so line items are
// modeled defensively here rather than guessed exactly.
export interface OrderItemRecord {
  id?: number;
  store_product_id: number;
  medicine_name?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderRecord {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  payment_method: string | null;
  customer_id: number | null;
  store?: { id: number; name: string };
  items: OrderItemRecord[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  shipping_address: string | null;
  notes: string | null;
  placed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function createOrder(
  token: string,
  storeId: number | string,
  payload: OrderPayload
): Promise<OrderRecord> {
  const res = await apiFetch<{ data: OrderRecord }>(`/stores/${storeId}/orders`, {
    method: "POST",
    token,
    body: payload,
  });
  return res.data;
}

export async function fetchOrders(
  token: string,
  storeId: number | string,
  status?: OrderStatus
): Promise<{ orders: OrderRecord[]; failed: boolean }> {
  try {
    const query = status ? `?status=${status}` : "";
    const res = await apiFetch<{ data: OrderRecord[] }>(`/stores/${storeId}/orders${query}`, { token });
    return { orders: res?.data ?? [], failed: false };
  } catch {
    return { orders: [], failed: true };
  }
}

export async function fetchOrder(
  token: string,
  storeId: number | string,
  orderId: number | string
): Promise<OrderRecord | null> {
  try {
    const res = await apiFetch<{ data: OrderRecord }>(`/stores/${storeId}/orders/${orderId}`, { token });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export async function updateOrderStatus(
  token: string,
  storeId: number | string,
  orderId: number | string,
  status: OrderStatus
): Promise<OrderRecord> {
  const res = await apiFetch<{ message: string; data: OrderRecord }>(
    `/stores/${storeId}/orders/${orderId}/status`,
    { method: "PATCH", token, body: { status } }
  );
  return res.data;
}
