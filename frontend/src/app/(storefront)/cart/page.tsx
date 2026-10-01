"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Trash2, Lock } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatINR } from "@/lib/format";
import { LinkButton, Button } from "@/components/ui/Button";
import { validateCoupon } from "@/lib/actions/coupons";

export default function CartPage() {
  const { lines, setQuantity, removeItem, subtotal, coupon, setCoupon, clear } = useCartStore();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-bold text-cocoa-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-cocoa-400">Add some chocolate to get started.</p>
        <LinkButton href="/shop" className="mt-6">
          Continue Shopping
        </LinkButton>
      </div>
    );
  }

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const total = Math.max(0, subtotal() - (coupon?.discount ?? 0));

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplying(true);
    setPromoError(null);
    try {
      const result = await validateCoupon(promoInput, subtotal());
      if (!result.valid) {
        setPromoError(result.error);
        setCoupon(null);
      } else {
        setCoupon({ code: result.code, discount: result.discount });
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Your Atelier Cart</h1>
      <p className="mt-1 text-sm text-cocoa-500">
        You have {itemCount} item{itemCount === 1 ? "" : "s"} selected from the Seasonal favor series.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-cocoa-100">
            {lines.map((line) => (
              <li key={line.variantId} className="flex gap-4 py-5">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-cocoa-50">
                  {line.image && <Image src={line.image} alt={line.name} fill className="object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-cocoa-900">{line.name}</p>
                      <p className="text-xs text-cocoa-400">{line.variantLabel}</p>
                    </div>
                    <p className="text-sm font-semibold text-cocoa-800">
                      {formatINR(line.price * line.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded border border-cocoa-200">
                      <button
                        onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                        className="p-2 text-cocoa-700"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-xs font-medium">{line.quantity}</span>
                      <button
                        onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                        className="p-2 text-cocoa-700"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(line.variantId)}
                      className="text-cocoa-400 hover:text-danger-600"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/shop" className="flex items-center gap-1.5 font-medium text-cocoa-900 underline">
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
            <button onClick={clear} className="text-cocoa-400 underline hover:text-cocoa-700">
              Clear Cart
            </button>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-cocoa-100 p-6">
          <p className="font-serif text-lg font-semibold text-cocoa-900">Order Summary</p>
          <div className="mt-4 space-y-2 text-sm text-cocoa-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatINR(subtotal())}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-cocoa-700">
                <span>Discount ({coupon.code})</span>
                <span>−{formatINR(coupon.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-cocoa-400">Calculated at checkout</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="text-cocoa-400">Calculated at checkout</span>
            </div>
          </div>

          <div className="mt-4 border-t border-cocoa-100 pt-4">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">Promo Code</p>
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter code..."
                className="w-full rounded border border-cocoa-200 px-3 py-2 text-sm focus:border-cocoa-800 focus:outline-none"
              />
              <Button size="sm" onClick={handleApplyPromo} disabled={applying}>
                Apply
              </Button>
            </div>
            {promoError && <p className="mt-1.5 text-xs text-danger-600">{promoError}</p>}
            {coupon && !promoError && <p className="mt-1.5 text-xs text-success-600">{coupon.code} applied</p>}
          </div>

          <div className="mt-4 flex justify-between border-t border-cocoa-100 pt-4 text-base font-semibold text-cocoa-900">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>

          <LinkButton href="/checkout" className="mt-6 w-full">
            Proceed to Checkout
          </LinkButton>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-cocoa-400">
            <Lock size={12} /> Secure payment processing
          </p>
        </div>
      </div>
    </div>
  );
}
