"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Minus, Phone, Plus, Printer, Receipt, Search, ShoppingCart, Store, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";
import { findCustomerByPhone, createCustomerByPhone } from "@/lib/customers";
import type { ApiUser } from "@/lib/api-client";
import type { StoreProductRecord } from "@/lib/stores";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

export default function PosPage() {
  const { token } = useAuth();
  const {
    myStore,
    myStoreLoading,
    storeProducts,
    submitOrder,
    lastOrder,
    lastOrderCustomer,
    recordSale,
    printOrder,
    clearLastOrder,
  } = useStore();

  const [posQuery, setPosQuery] = useState("");
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [posPaymentMethod, setPosPaymentMethod] = useState("Cash");
  const [posDiscount, setPosDiscount] = useState("");
  const [posDeliveryFee, setPosDeliveryFee] = useState("");
  const [posNotes, setPosNotes] = useState("");
  const [posSubmitting, setPosSubmitting] = useState(false);

  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posCustomer, setPosCustomer] = useState<ApiUser | null>(null);
  const [posCustomerLoading, setPosCustomerLoading] = useState(false);
  const [posCustomerNotFound, setPosCustomerNotFound] = useState(false);
  const [posNewCustomerName, setPosNewCustomerName] = useState("");
  const [posCustomerCreating, setPosCustomerCreating] = useState(false);

  const addToCart = (product: StoreProductRecord) => {
    // Starting to build a new sale — the previous one's completed-order
    // panel (with its Print buttons) no longer applies, so clear it out.
    if (lastOrder) clearLastOrder();
    setPosCart((cart) => {
      const existing = cart.find((c) => c.productId === product.id);
      if (existing) {
        return cart.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [
        ...cart,
        { productId: product.id, name: product.medicine_name ?? "Medicine", price: product.sale_price, qty: 1 },
      ];
    });
  };

  const updateCartQty = (productId: number, qty: number) => {
    setPosCart((cart) => {
      if (qty <= 0) return cart.filter((c) => c.productId !== productId);
      return cart.map((c) => (c.productId === productId ? { ...c, qty } : c));
    });
  };

  const removeFromCart = (productId: number) => {
    setPosCart((cart) => cart.filter((c) => c.productId !== productId));
  };

  const posTotal = posCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const clearPosCustomer = () => {
    setPosCustomer(null);
    setPosCustomerPhone("");
    setPosCustomerNotFound(false);
    setPosNewCustomerName("");
  };

  const searchPosCustomer = async () => {
    if (!token) return;
    const phone = posCustomerPhone.trim();
    if (!phone) return;
    setPosCustomerLoading(true);
    setPosCustomerNotFound(false);
    const found = await findCustomerByPhone(token, phone);
    if (found) {
      setPosCustomer(found);
    } else {
      setPosCustomerNotFound(true);
    }
    setPosCustomerLoading(false);
  };

  const createPosCustomer = async () => {
    if (!token) return;
    const phone = posCustomerPhone.trim();
    if (!phone) return;
    setPosCustomerCreating(true);
    try {
      const created = await createCustomerByPhone(token, phone, {
        name: posNewCustomerName.trim() || phone,
      });
      setPosCustomer(created);
      setPosCustomerNotFound(false);
    } catch {
      toast.error("Could not add this customer.");
    } finally {
      setPosCustomerCreating(false);
    }
  };

  // Auto-search once a full phone number has been typed, so a compounder
  // can just type the number and see the match without an extra click —
  // Enter or the search button still work immediately for anyone who
  // doesn't want to wait out the debounce.
  useEffect(() => {
    const phone = posCustomerPhone.trim();
    if (posCustomer || phone.length < 10) return;
    const handle = setTimeout(() => searchPosCustomer(), 500);
    return () => clearTimeout(handle);
  }, [posCustomerPhone]); // eslint-disable-line react-hooks/exhaustive-deps

  const completeSale = async () => {
    if (posCart.length === 0) return;
    setPosSubmitting(true);
    const order = await submitOrder({
      items: posCart.map((c) => ({ store_product_id: c.productId, quantity: c.qty })),
      customer_id: posCustomer?.id,
      payment_method: posPaymentMethod || undefined,
      discount: posDiscount.trim() ? Number(posDiscount) : undefined,
      delivery_fee: posDeliveryFee.trim() ? Number(posDeliveryFee) : undefined,
      notes: posNotes.trim() || undefined,
    });
    setPosSubmitting(false);
    if (order) {
      recordSale(order, posCustomer);
      setPosCart([]);
      setPosDiscount("");
      setPosDeliveryFee("");
      setPosNotes("");
      clearPosCustomer();
    }
  };

  if (!myStoreLoading && !myStore) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
        <Store className="size-8 text-muted-foreground" />
        <p className="font-semibold text-foreground">No store yet</p>
        <p className="text-sm text-muted-foreground">Register a store and add products before you can use the POS.</p>
        <Button render={<Link href="/dashboard/store/shop" />} nativeButton={false} size="sm">
          Go to Shop
        </Button>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-border/60 p-6">
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <ShoppingCart className="size-5 text-primary" />
              Point of Sale
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Search a product and add it to the cart.</p>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={posQuery}
                onChange={(e) => setPosQuery(e.target.value)}
                placeholder="Search products…"
                className="pl-8"
              />
            </div>

            <div className="mt-4 max-h-[540px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
                {storeProducts
                  .filter((p) => p.is_active)
                  .filter(
                    (p) => !posQuery.trim() || (p.medicine_name ?? "").toLowerCase().includes(posQuery.trim().toLowerCase())
                  )
                  .map((p) => {
                    const outOfStock = (p.current_stock ?? 0) <= 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addToCart(p)}
                        disabled={outOfStock}
                        className="group relative flex flex-col items-start gap-1 rounded-xl border border-border/60 bg-background p-3.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
                      >
                        <span className="line-clamp-2 text-sm font-semibold text-foreground">
                          {p.medicine_name ?? `Medicine #${p.medicine_id}`}
                        </span>
                        <span className="text-base font-bold text-primary">৳{p.sale_price}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {outOfStock ? "Out of stock" : `${p.current_stock} in stock`}
                        </span>
                        {!outOfStock && (
                          <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            <Plus className="size-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                {storeProducts.filter((p) => p.is_active).length === 0 && (
                  <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
                    No active products yet — add some from the Products page.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="overflow-hidden border-border/60 p-0 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 border-b border-border/60 px-5 py-4">
              <Receipt className="size-4 text-primary" />
              <h3 className="font-semibold text-foreground">Current Sale</h3>
              {posCart.length > 0 && (
                <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {posCart.reduce((n, c) => n + c.qty, 0)} item
                  {posCart.reduce((n, c) => n + c.qty, 0) === 1 ? "" : "s"}
                </span>
              )}
            </div>

            {posCart.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <ShoppingCart className="size-7 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Tap a product on the left to add it here.</p>
              </div>
            ) : (
              <div className="px-5 py-4">
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {posCart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ৳{item.price} × {item.qty} = ৳{(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => updateCartQty(item.productId, item.qty - 1)}
                          aria-label="Decrease"
                        >
                          <Minus />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => updateCartQty(item.productId, Number(e.target.value) || 1)}
                          className="h-7 w-14 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => updateCartQty(item.productId, item.qty + 1)}
                          aria-label="Increase"
                        >
                          <Plus />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label="Remove"
                        >
                          <X />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label htmlFor="posDiscount" className="text-xs whitespace-nowrap">
                      Discount
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                        ৳
                      </span>
                      <Input
                        id="posDiscount"
                        type="number"
                        min={0}
                        step="0.01"
                        className="h-8 pl-6"
                        value={posDiscount}
                        onChange={(e) => setPosDiscount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="posDeliveryFee" className="text-xs whitespace-nowrap">
                      Delivery
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                        ৳
                      </span>
                      <Input
                        id="posDeliveryFee"
                        type="number"
                        min={0}
                        step="0.01"
                        className="h-8 pl-6"
                        value={posDeliveryFee}
                        onChange={(e) => setPosDeliveryFee(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 space-y-1">
                  <Label htmlFor="posPaymentMethod" className="text-xs">
                    Payment Method
                  </Label>
                  <Select value={posPaymentMethod} onValueChange={(v) => setPosPaymentMethod(v ?? "Cash")}>
                    <SelectTrigger className="h-8 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Mobile Banking">Mobile Banking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-2.5 space-y-1">
                  <Label htmlFor="posNotes" className="text-xs">
                    Notes (optional)
                  </Label>
                  <Input id="posNotes" className="h-8" value={posNotes} onChange={(e) => setPosNotes(e.target.value)} />
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>৳{posTotal.toFixed(2)}</span>
                  </div>
                  {Number(posDiscount) > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Discount</span>
                      <span>−৳{Number(posDiscount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(posDeliveryFee) > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Delivery Fee</span>
                      <span>৳{Number(posDeliveryFee).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-1 border-t border-dashed border-border/60 pt-3">
                  <Label className="text-xs">Customer (optional)</Label>
                  {posCustomer ? (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{posCustomer.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {posCustomer.phone}
                          {posCustomer.address ? ` · ${posCustomer.address}` : ""}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon-xs" onClick={clearPosCustomer} aria-label="Change customer">
                        <X />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Phone className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={posCustomerPhone}
                          onChange={(e) => {
                            setPosCustomerPhone(e.target.value);
                            setPosCustomerNotFound(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              searchPosCustomer();
                            }
                          }}
                          placeholder="Phone number"
                          className="h-8 pl-8"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={searchPosCustomer}
                        disabled={posCustomerLoading || !posCustomerPhone.trim()}
                        aria-label="Search customer"
                      >
                        <Search />
                      </Button>
                    </div>
                  )}
                  {posCustomerLoading && <p className="text-xs text-muted-foreground">Searching…</p>}
                  {posCustomerNotFound && !posCustomerLoading && (
                    <div className="space-y-2 rounded-lg border border-dashed border-border/60 p-2.5">
                      <p className="text-xs text-muted-foreground">
                        No account for {posCustomerPhone} — add as a new customer?
                      </p>
                      <Input
                        value={posNewCustomerName}
                        onChange={(e) => setPosNewCustomerName(e.target.value)}
                        placeholder="Customer name (optional)"
                        className="h-8"
                      />
                      <Button size="sm" className="w-full" onClick={createPosCustomer} disabled={posCustomerCreating}>
                        {posCustomerCreating ? "Adding..." : "Add Customer"}
                      </Button>
                    </div>
                  )}
                </div>

                {(() => {
                  const grandTotal = Math.max(0, posTotal - Number(posDiscount || 0) + Number(posDeliveryFee || 0));
                  return (
                    <>
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-xl font-bold text-primary">৳{grandTotal.toFixed(2)}</span>
                      </div>

                      <Button className="mt-3 w-full" size="lg" onClick={completeSale} disabled={posSubmitting}>
                        {posSubmitting ? "Processing..." : `Complete Sale · ৳${grandTotal.toFixed(2)}`}
                      </Button>
                    </>
                  );
                })()}
              </div>
            )}

            {lastOrder && (
              <div className="mx-5 mb-5 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Order {lastOrder.order_number} completed</p>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={clearLastOrder}
                    aria-label="Dismiss"
                  >
                    <X />
                  </Button>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {lastOrder.items.map((item, i) => (
                    <div key={item.id ?? i} className="flex justify-between">
                      <span>
                        {item.medicine_name ?? `Item #${item.store_product_id}`} × {item.quantity}
                      </span>
                      <span>৳{Number(item.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between border-t border-border/60 pt-2 text-sm font-semibold text-foreground">
                  <span>Total</span>
                  <span>৳{Number(lastOrder.total).toFixed(2)}</span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => printOrder(lastOrder, lastOrderCustomer, "80mm")}
                  >
                    <Printer />
                    Print 80mm Receipt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => printOrder(lastOrder, lastOrderCustomer, "a4")}
                  >
                    <Printer />
                    Print A4 Invoice
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
