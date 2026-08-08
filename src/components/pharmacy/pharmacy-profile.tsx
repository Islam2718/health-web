"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Clock,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MedicalStore } from "@/lib/pharmacy-data";

export function PharmacyProfile({ store }: { store: MedicalStore }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const addToCart = (name: string) =>
    setCart((c) => ({ ...c, [name]: (c[name] ?? 0) + 1 }));

  const decrementFromCart = (name: string) =>
    setCart((c) => {
      const next = { ...c };
      if (!next[name]) return c;
      next[name] -= 1;
      if (next[name] <= 0) delete next[name];
      return next;
    });

  const { itemCount, total } = useMemo(() => {
    let itemCount = 0;
    let total = 0;
    for (const [name, qty] of Object.entries(cart)) {
      const med = store.medicines.find((m) => m.name === name);
      if (!med) continue;
      itemCount += qty;
      total += med.price * qty;
    }
    return { itemCount, total };
  }, [cart, store.medicines]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative h-56 overflow-hidden rounded-3xl sm:h-72"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={store.image} alt={store.name} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{store.type}</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{store.name}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="size-4" />
              {store.address}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
            <Star className="size-4 fill-happy-sky text-happy-sky" />
            {store.rating} ({store.reviews} reviews)
          </div>
        </div>
        {store.deliveryAvailable && (
          <Badge className="absolute top-4 right-4 gap-1 bg-white/90 text-primary hover:bg-white/90">
            <Truck className="size-3.5" />
            Delivery Available
          </Badge>
        )}
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <Card className="border-border/60 p-6">
              <h2 className="font-semibold text-foreground">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {store.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {store.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Card className="mt-6 border-border/60 p-6">
              <h2 className="font-semibold text-foreground">Medicines</h2>
              <div className="mt-4 divide-y divide-border/60">
                {store.medicines.map((med) => {
                  const qty = cart[med.name] ?? 0;
                  return (
                    <div
                      key={med.name}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {med.name}
                          </p>
                          {med.requiresPrescription && (
                            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-medium text-secondary-foreground">
                              Rx
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {med.category} · {med.inStock ? "In stock" : "Out of stock"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <p className="text-sm font-semibold text-foreground">৳{med.price}</p>
                        {!med.inStock ? (
                          <Button size="sm" variant="secondary" disabled>
                            Unavailable
                          </Button>
                        ) : qty > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon-sm"
                              variant="outline"
                              onClick={() => decrementFromCart(med.name)}
                            >
                              <Minus />
                            </Button>
                            <span className="w-4 text-center text-sm font-medium">{qty}</span>
                            <Button size="icon-sm" onClick={() => addToCart(med.name)}>
                              <Plus />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => addToCart(med.name)}>
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:sticky lg:top-24"
          >
            <Card className="border-border/60 p-6">
              <h2 className="font-semibold text-foreground">Store Info</h2>
              <div className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  {store.openHours}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  {store.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-primary" />
                  {store.deliveryAvailable
                    ? `Delivery in ${store.deliveryTime}`
                    : "In-store pickup only"}
                </div>
              </div>

              <Separator className="my-5" />

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <ShoppingCart className="size-4 text-primary" />
                  Cart
                </span>
                <span className="text-muted-foreground">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">৳{total}</span>
              </div>

              <Button
                className="mt-4 w-full"
                disabled={itemCount === 0}
                onClick={() => {
                  setCheckoutOpen(true);
                  setOrdered(false);
                }}
              >
                <ShoppingCart />
                Checkout
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm your order</DialogTitle>
            <DialogDescription>Review your cart before placing the order.</DialogDescription>
          </DialogHeader>

          <div className="max-h-56 space-y-2 overflow-y-auto">
            {Object.entries(cart).map(([name, qty]) => {
              const med = store.medicines.find((m) => m.name === name);
              if (!med) return null;
              return (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {name} <span className="text-muted-foreground">× {qty}</span>
                  </span>
                  <span className="font-medium text-foreground">৳{med.price * qty}</span>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
            <span>Total</span>
            <span>৳{total}</span>
          </div>

          <DialogFooter>
            <Button className="w-full sm:w-auto" onClick={() => setOrdered(true)}>
              {ordered ? "Order Placed ✓" : "Place Order"}
            </Button>
          </DialogFooter>

          {ordered && (
            <p className="text-center text-xs text-muted-foreground">
              This is a demo order — no real medicines have been dispatched.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
