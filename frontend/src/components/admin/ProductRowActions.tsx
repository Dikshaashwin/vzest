"use client";

import { useTransition } from "react";
import { deleteProduct, toggleProductActive } from "@/lib/actions/products";

export function ProductRowActions({ productId, isActive }: { productId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-3 text-xs">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleProductActive(productId, !isActive))}
        className="font-medium text-cocoa-600 hover:underline disabled:opacity-50"
      >
        {isActive ? "Hide" : "Activate"}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this product permanently?")) {
            startTransition(() => deleteProduct(productId));
          }
        }}
        className="font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
