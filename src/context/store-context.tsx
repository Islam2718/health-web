"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { extractApiErrorMessage, type ApiUser } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import {
  fetchStores,
  createStore,
  updateStore,
  fetchStoreProducts,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  fetchStoreStocks,
  createStoreStock,
  createOrder,
  fetchOrders,
  updateOrderStatus,
  type StoreRecord,
  type StorePayload,
  type StoreProductRecord,
  type StoreProductPayload,
  type StoreStockRecord,
  type StoreStockPayload,
  type OrderRecord,
  type OrderPayload,
  type OrderStatus,
} from "@/lib/stores";

interface StoreContextValue {
  myStore: StoreRecord | null;
  myStoreLoading: boolean;
  refreshMyStore: () => Promise<void>;
  saveStoreProfile: (payload: StorePayload) => Promise<StoreRecord | null>;

  storeProducts: StoreProductRecord[];
  storeProductsLoading: boolean;
  refreshStoreProducts: () => Promise<void>;
  addProduct: (payload: StoreProductPayload) => Promise<StoreProductRecord | null>;
  editProduct: (id: number, payload: StoreProductPayload) => Promise<StoreProductRecord | null>;
  removeProduct: (id: number) => Promise<boolean>;

  storeStocks: StoreStockRecord[];
  storeStocksLoading: boolean;
  refreshStoreStocks: () => Promise<void>;
  addStockTransaction: (payload: StoreStockPayload) => Promise<StoreStockRecord | null>;

  storeOrders: OrderRecord[];
  storeOrdersLoading: boolean;
  storeOrdersFailed: boolean;
  refreshStoreOrders: () => Promise<void>;
  submitOrder: (payload: OrderPayload) => Promise<OrderRecord | null>;
  changeOrderStatus: (order: OrderRecord, status: OrderStatus) => Promise<boolean>;

  // Invoice printing — shared so POS (right after a sale) and the Orders
  // page (reopening an older one) both trigger the one print area mounted
  // once in the store layout, instead of each page carrying its own copy.
  lastOrder: OrderRecord | null;
  lastOrderCustomer: ApiUser | null;
  printInvoiceMode: { size: "80mm" | "a4" } | null;
  recordSale: (order: OrderRecord, customer: ApiUser | null) => void;
  printOrder: (order: OrderRecord, customer: ApiUser | null, size: "80mm" | "a4") => void;
  clearLastOrder: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { token, setStore } = useAuth();

  const [myStore, setMyStore] = useState<StoreRecord | null>(null);
  const [myStoreLoading, setMyStoreLoading] = useState(true);

  const [storeProducts, setStoreProducts] = useState<StoreProductRecord[]>([]);
  const [storeProductsLoading, setStoreProductsLoading] = useState(true);

  const [storeStocks, setStoreStocks] = useState<StoreStockRecord[]>([]);
  const [storeStocksLoading, setStoreStocksLoading] = useState(true);

  const [storeOrders, setStoreOrders] = useState<OrderRecord[]>([]);
  const [storeOrdersLoading, setStoreOrdersLoading] = useState(true);
  const [storeOrdersFailed, setStoreOrdersFailed] = useState(false);

  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);
  const [lastOrderCustomer, setLastOrderCustomer] = useState<ApiUser | null>(null);
  // Wrapped in a fresh object on every trigger (not a bare "80mm"/"a4"
  // string) so re-clicking Print with the *same* size right after the
  // previous print still changes the state — a bare string would be equal
  // to itself and React would skip re-running the print effect below.
  const [printInvoiceMode, setPrintInvoiceMode] = useState<{ size: "80mm" | "a4" } | null>(null);

  const refreshMyStore = async () => {
    if (!token) return;
    setMyStoreLoading(true);
    const { stores } = await fetchStores(token);
    const store = stores[0] ?? null;
    setMyStore(store);
    setStore(store?.id ?? null);
    setMyStoreLoading(false);
  };

  useEffect(() => {
    if (!token) return;
    refreshMyStore();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshStoreProducts = async () => {
    if (!token || !myStore) return;
    setStoreProductsLoading(true);
    const { products } = await fetchStoreProducts(token, myStore.id);
    setStoreProducts(products);
    setStoreProductsLoading(false);
  };

  const refreshStoreStocks = async () => {
    if (!token || !myStore) return;
    setStoreStocksLoading(true);
    const { stocks } = await fetchStoreStocks(token, myStore.id);
    setStoreStocks(stocks);
    setStoreStocksLoading(false);
  };

  const refreshStoreOrders = async () => {
    if (!token || !myStore) return;
    setStoreOrdersLoading(true);
    const { orders, failed } = await fetchOrders(token, myStore.id);
    setStoreOrders(orders);
    setStoreOrdersFailed(failed);
    setStoreOrdersLoading(false);
  };

  useEffect(() => {
    if (!token || !myStore) {
      setStoreProductsLoading(false);
      setStoreStocksLoading(false);
      setStoreOrdersLoading(false);
      return;
    }
    refreshStoreProducts();
    refreshStoreStocks();
    refreshStoreOrders();
  }, [token, myStore?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!printInvoiceMode) return;
    window.print();
    // Clear it once the print dialog closes (printed or cancelled) so
    // clicking Print again on the same order re-fires this effect instead
    // of silently no-opping because the state didn't change.
    const clear = () => setPrintInvoiceMode(null);
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, [printInvoiceMode]);

  const saveStoreProfile = async (payload: StorePayload): Promise<StoreRecord | null> => {
    if (!token) return null;
    try {
      const saved = myStore ? await updateStore(token, myStore.id, payload) : await createStore(token, payload);
      setMyStore(saved);
      setStore(saved.id);
      toast.success(myStore ? "Store updated" : "Store registered");
      return saved;
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not save your store."));
      return null;
    }
  };

  const addProduct = async (payload: StoreProductPayload): Promise<StoreProductRecord | null> => {
    if (!token || !myStore) return null;
    try {
      const saved = await createStoreProduct(token, myStore.id, payload);
      setStoreProducts((list) => [saved, ...list]);
      toast.success("Product added to store");
      return saved;
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not save this product."));
      return null;
    }
  };

  const editProduct = async (id: number, payload: StoreProductPayload): Promise<StoreProductRecord | null> => {
    if (!token || !myStore) return null;
    try {
      const saved = await updateStoreProduct(token, myStore.id, id, payload);
      setStoreProducts((list) => list.map((p) => (p.id === saved.id ? saved : p)));
      toast.success("Product updated");
      return saved;
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not save this product."));
      return null;
    }
  };

  const removeProduct = async (id: number): Promise<boolean> => {
    if (!token || !myStore) return false;
    try {
      await deleteStoreProduct(token, myStore.id, id);
      setStoreProducts((list) => list.filter((p) => p.id !== id));
      toast.success("Product removed");
      return true;
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not remove that product."));
      return false;
    }
  };

  const addStockTransaction = async (payload: StoreStockPayload): Promise<StoreStockRecord | null> => {
    if (!token || !myStore) return null;
    try {
      const created = await createStoreStock(token, myStore.id, payload);
      setStoreStocks((list) => [created, ...list]);
      toast.success("Stock updated");
      refreshStoreProducts(); // current_stock lives on the product record
      return created;
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not update the stock."));
      return null;
    }
  };

  const recordSale = (order: OrderRecord, customer: ApiUser | null) => {
    setLastOrder(order);
    setLastOrderCustomer(customer);
  };

  const submitOrder = async (payload: OrderPayload): Promise<OrderRecord | null> => {
    if (!token || !myStore) return null;
    try {
      const order = await createOrder(token, myStore.id, payload);
      toast.success(`Order ${order.order_number} completed`);
      return order;
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not complete this sale."));
      return null;
    } finally {
      refreshStoreProducts();
      refreshStoreOrders();
    }
  };

  const changeOrderStatus = async (order: OrderRecord, status: OrderStatus): Promise<boolean> => {
    if (!token || !myStore) return false;
    try {
      const updated = await updateOrderStatus(token, myStore.id, order.id, status);
      setStoreOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
      if (lastOrder?.id === updated.id) setLastOrder(updated);
      toast.success("Order status updated");
      return true;
    } catch (err) {
      toast.error(extractApiErrorMessage(err, "Could not update this order's status."));
      return false;
    }
  };

  const printOrder = (order: OrderRecord, customer: ApiUser | null, size: "80mm" | "a4") => {
    setLastOrder(order);
    setLastOrderCustomer(customer);
    setPrintInvoiceMode({ size });
  };

  const clearLastOrder = () => {
    setLastOrder(null);
    setLastOrderCustomer(null);
  };

  return (
    <StoreContext.Provider
      value={{
        myStore,
        myStoreLoading,
        refreshMyStore,
        saveStoreProfile,
        storeProducts,
        storeProductsLoading,
        refreshStoreProducts,
        addProduct,
        editProduct,
        removeProduct,
        storeStocks,
        storeStocksLoading,
        refreshStoreStocks,
        addStockTransaction,
        storeOrders,
        storeOrdersLoading,
        storeOrdersFailed,
        refreshStoreOrders,
        submitOrder,
        changeOrderStatus,
        lastOrder,
        lastOrderCustomer,
        printInvoiceMode,
        recordSale,
        printOrder,
        clearLastOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
