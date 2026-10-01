"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { formatINR } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

type NumberLike = number | string | { toString(): string };

type Variant = {
  id: string;
  label: string;
  price: NumberLike;
  comparePrice?: NumberLike | null;
  stock: number;
};

export function AddToCartPanel({
  productId,
  productName,
  image,
  variants,
}: {
  productId: string;
  productName: string;
  image?: string;
  variants: Variant[];
}) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  if (!variant) {
    return <p className="text-sm text-cocoa-400">This product is currently unavailable.</p>;
  }

  const outOfStock = variant.stock === 0;

  const handleAdd = () => {
    addItem(
      {
        productId,
        variantId: variant.id,
        name: productName,
        variantLabel: variant.label,
        price: Number(variant.price),
        image,
        maxStock: variant.stock,
      },
      quantity
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="flex items-baseline gap-2 text-2xl font-semibold text-cocoa-900">
          {formatINR(variant.price)}
          {variant.comparePrice && Number(variant.comparePrice) > Number(variant.price) && (
            <span className="text-base font-normal text-cocoa-300 line-through">
              {formatINR(variant.comparePrice)}
            </span>
          )}
        </p>
        {outOfStock ? (
          <p className="mt-1 text-sm font-medium text-danger-600">Out of stock</p>
        ) : variant.stock <= 10 ? (
          <p className="mt-1 text-sm font-medium text-warning-600">Only {variant.stock} left</p>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">Weight</p>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setVariantId(v.id);
                setQuantity(1);
              }}
              disabled={v.stock === 0}
              className={clsx(
                "rounded border px-4 py-2 text-xs font-medium disabled:opacity-40",
                v.id === variant.id
                  ? "border-cocoa-900 bg-cocoa-900 text-white"
                  : "border-cocoa-200 text-cocoa-700 hover:border-cocoa-800"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded border border-cocoa-200">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2.5 text-cocoa-700 disabled:opacity-30"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(variant.stock, q + 1))}
            className="p-2.5 text-cocoa-700 disabled:opacity-30"
            disabled={quantity >= variant.stock}
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>

        <Button className="flex-1" disabled={outOfStock} onClick={handleAdd}>
          {outOfStock ? "Out of Stock" : `Add to Cart — ${formatINR(Number(variant.price) * quantity)}`}
        </Button>
      </div>

      <button
        disabled={outOfStock}
        onClick={() => {
          handleAdd();
          router.push("/cart");
        }}
        className="w-full text-center text-xs font-semibold uppercase tracking-wider text-cocoa-600 underline hover:text-cocoa-900 disabled:opacity-40"
      >
        Buy Now
      </button>
    </div>
  );
}
