"use client";

import { useTransition } from "react";
import { deleteCoupon, toggleCouponActive } from "@/lib/actions/coupons";

export function CouponRowActions({ couponId, isActive }: { couponId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-3 text-xs">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleCouponActive(couponId, !isActive))}
        className="font-medium text-cocoa-600 hover:underline disabled:opacity-50"
      >
        {isActive ? "Deactivate" : "Activate"}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this coupon?")) startTransition(() => deleteCoupon(couponId));
        }}
        className="font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
