"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/dashboard/store/product-form";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update this product&apos;s details.</p>
      </div>
      <div className="mx-auto max-w-2xl">
        <ProductForm productId={Number(params.id)} />
      </div>
    </div>
  );
}
