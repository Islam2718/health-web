"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/dashboard/store/product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/dashboard/store/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to products
      </Link>
      <div className="mx-auto mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a medicine you sell at this store.</p>
      </div>
      <div className="mx-auto max-w-2xl">
        <ProductForm />
      </div>
    </div>
  );
}
