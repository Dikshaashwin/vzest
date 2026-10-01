"use client";

import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";

type NumberLike = number | string | { toString(): string };

export type ProductCardData = {
  slug: string;
  id?: string;
  name: string;
  shortDescription?: string | null;
  cocoaLabel?: string | null;
  images: { url: string; altText?: string | null }[];
  variants: { id?: string; label?: string; price: NumberLike; comparePrice?: NumberLike | null; stock: number }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem);

  const cheapest = product.variants.reduce<(typeof product.variants)[number] | null>((min, v) => {
    if (!min || Number(v.price) < Number(min.price)) return v;
    return min;
  }, null);

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const image = product.images[0];
  const soldOut = totalStock === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cheapest?.id || !product.id) return;
    addItem(
      {
        productId: product.id,
        variantId: cheapest.id,
        name: product.name,
        variantLabel: cheapest.label ?? "",
        price: Number(cheapest.price),
        image: image?.url,
        maxStock: cheapest.stock,
      },
      1
    );
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-cocoa-50">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${soldOut ? "grayscale opacity-70" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-cocoa-200">No image</div>
        )}

        {product.cocoaLabel && !soldOut && (
          <span className="absolute left-3 bottom-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cocoa-800">
            {product.cocoaLabel}
          </span>
        )}

        {soldOut && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-cocoa-800">
            Sold Out
          </span>
        )}

        {!soldOut && cheapest?.id && (
          <button
            onClick={handleQuickAdd}
            className="absolute inset-x-0 bottom-0 translate-y-full bg-cocoa-900 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
          >
            + Quick Add
          </button>
        )}
      </div>
      <div className="mt-3">
        <h3 className={`text-sm font-medium ${soldOut ? "text-cocoa-300" : "text-cocoa-900"}`}>{product.name}</h3>
        {product.shortDescription && !soldOut && (
          <p className="mt-1 line-clamp-1 text-xs text-cocoa-400">{product.shortDescription}</p>
        )}
        {cheapest && (
          <p className={`mt-1.5 flex items-center gap-2 text-sm font-semibold ${soldOut ? "text-cocoa-300" : "text-cocoa-800"}`}>
            <span className={soldOut ? "line-through" : ""}>{formatINR(cheapest.price)}</span>
            {cheapest.comparePrice && Number(cheapest.comparePrice) > Number(cheapest.price) && !soldOut && (
              <span className="text-xs font-normal text-cocoa-300 line-through">
                {formatINR(cheapest.comparePrice)}
              </span>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}
