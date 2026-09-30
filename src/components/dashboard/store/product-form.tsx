"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MedicineSearchInput } from "@/components/dashboard/medicine-search-input";
import { useStore } from "@/context/store-context";

interface ProductFormProps {
  productId?: number;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const { storeProducts, storeProductsLoading, addProduct, editProduct, addStockTransaction } = useStore();
  const isEditing = productId != null;
  const existing = isEditing ? storeProducts.find((p) => p.id === productId) : undefined;

  const [medicineId, setMedicineId] = useState<number | null>(null);
  const [medicineQuery, setMedicineQuery] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefilled, setPrefilled] = useState(!isEditing);

  useEffect(() => {
    if (!isEditing || prefilled || !existing) return;
    setMedicineId(existing.medicine_id);
    setMedicineQuery(existing.medicine_name ?? "");
    setBuyPrice(String(existing.buy_price));
    setSalePrice(String(existing.sale_price));
    setWholesalePrice(String(existing.wholesale_price));
    setMinStock(existing.minimum_stock != null ? String(existing.minimum_stock) : "");
    setIsActive(existing.is_active);
    setPrefilled(true);
  }, [isEditing, prefilled, existing]);

  const submit = async () => {
    if (!medicineId) {
      toast.error("Search and select a medicine first.");
      return;
    }
    if (!isEditing && storeProducts.some((p) => p.medicine_id === medicineId)) {
      toast.error("This medicine is already in your product list — edit it from there instead.");
      return;
    }
    if (!buyPrice.trim() || !salePrice.trim() || !wholesalePrice.trim()) {
      toast.error("Enter buy, sale, and wholesale prices.");
      return;
    }
    setSaving(true);
    const payload = {
      medicine_id: medicineId,
      buy_price: Number(buyPrice),
      sale_price: Number(salePrice),
      wholesale_price: Number(wholesalePrice),
      minimum_stock: minStock.trim() ? Number(minStock) : undefined,
      is_active: isActive,
    };
    const saved = isEditing && productId != null ? await editProduct(productId, payload) : await addProduct(payload);

    if (saved && !isEditing) {
      // A new product starts with zero stock — if a starting quantity was
      // given, log it as a purchase right away instead of forcing a
      // separate trip to the Stock page. Skipped entirely when left blank.
      const qty = Number(initialQuantity);
      if (initialQuantity.trim() && qty > 0) {
        await addStockTransaction({
          store_product_id: saved.id,
          quantity: qty,
          transaction_type: "purchase",
          unit_price: Number(salePrice),
          remarks: "Initial stock on product creation",
          transaction_date: new Date().toISOString(),
        });
      }
    }

    setSaving(false);
    if (saved) router.push("/dashboard/store/products");
  };

  if (isEditing && storeProductsLoading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  if (isEditing && !existing) {
    return (
      <Card className="flex flex-col items-center gap-3 border-dashed border-border/60 p-10 text-center">
        <p className="font-semibold text-foreground">Product not found</p>
        <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/store/products")}>
          Back to Products
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 p-6">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Medicine</Label>
          <MedicineSearchInput
            value={medicineQuery}
            onValueChange={setMedicineQuery}
            disabledIds={!isEditing ? new Set(storeProducts.map((p) => p.medicine_id)) : undefined}
            disabledHint="Already added"
            onSelectMedicine={(m) => {
              const alreadyAdded = !isEditing && storeProducts.some((p) => p.medicine_id === m.id);
              if (alreadyAdded) {
                toast.error(`${m.name} is already in your product list — edit it from there instead.`);
                return;
              }
              setMedicineId(m.id);
              setMedicineQuery(m.weight ? `${m.name} ${m.weight}` : m.name);
              if (!buyPrice && m.suggestion_price != null) {
                setBuyPrice(String(m.suggestion_price));
              }
            }}
            placeholder="Search medicine by name…"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="productBuyPrice">Buy Price (৳)</Label>
            <Input
              id="productBuyPrice"
              type="number"
              min={0}
              step="0.01"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="productSalePrice">Sale Price (৳)</Label>
            <Input
              id="productSalePrice"
              type="number"
              min={0}
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="productWholesalePrice">Wholesale Price (৳)</Label>
            <Input
              id="productWholesalePrice"
              type="number"
              min={0}
              step="0.01"
              value={wholesalePrice}
              onChange={(e) => setWholesalePrice(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="productMinStock">Low Stock Warning (optional)</Label>
          <Input
            id="productMinStock"
            type="number"
            min={0}
            placeholder="e.g. 10"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />
        </div>
        {!isEditing && (
          <div className="space-y-1.5">
            <Label htmlFor="productInitialQuantity">Add Stock Quantity (optional)</Label>
            <Input
              id="productInitialQuantity"
              type="number"
              min={0}
              placeholder="e.g. 50"
              value={initialQuantity}
              onChange={(e) => setInitialQuantity(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Logs it as a Purchase (stock in) at the Sale Price above. Leave blank to add stock later from the
              Stock page.
            </p>
          </div>
        )}
        <div className="flex items-center justify-between rounded-xl bg-secondary/60 p-4">
          <Label htmlFor="productIsActive" className="cursor-pointer">
            Available for sale
          </Label>
          <Switch id="productIsActive" checked={isActive} onCheckedChange={setIsActive} />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/store/products")}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
