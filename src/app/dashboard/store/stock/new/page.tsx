"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/context/store-context";
import { STOCK_TRANSACTION_TYPES, type StockTransactionType } from "@/lib/stores";

export default function NewStockPage() {
  const router = useRouter();
  const { storeProducts, addStockTransaction } = useStore();

  const [productId, setProductId] = useState(storeProducts[0] ? String(storeProducts[0].id) : "");
  const [quantity, setQuantity] = useState("1");
  const [type, setType] = useState<StockTransactionType>("purchase");
  const [unitPrice, setUnitPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!productId) {
      toast.error("Select a product first.");
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    if (!unitPrice.trim()) {
      toast.error("Enter the unit price.");
      return;
    }
    setSaving(true);
    const created = await addStockTransaction({
      store_product_id: Number(productId),
      quantity: qty,
      transaction_type: type,
      unit_price: Number(unitPrice),
      remarks: remarks.trim() || undefined,
      transaction_date: new Date(date).toISOString(),
    });
    setSaving(false);
    if (created) router.push("/dashboard/store/stock");
  };

  return (
    <div>
      <Link
        href="/dashboard/store/stock"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to stock history
      </Link>
      <div className="mx-auto mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Update Stock</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log a purchase, sale, or adjustment.</p>
      </div>

      <Card className="mx-auto max-w-2xl border-border/60 p-6">
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Select value={productId} onValueChange={(v) => setProductId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select">
                    {(value: string) => storeProducts.find((p) => String(p.id) === value)?.medicine_name ?? "Select"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {storeProducts.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.medicine_name ?? `Medicine #${p.medicine_id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Transaction Type</Label>
              <Select value={type} onValueChange={(v) => setType((v as StockTransactionType) ?? "purchase")}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: StockTransactionType) =>
                      STOCK_TRANSACTION_TYPES.find((t) => t.value === value)?.label ?? value
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STOCK_TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="stockQuantity">Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stockUnitPrice">Unit Price (৳)</Label>
              <Input
                id="stockUnitPrice"
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stockDate">Date</Label>
              <Input id="stockDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stockRemarks">Notes (optional)</Label>
            <Textarea id="stockRemarks" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/store/stock")}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
