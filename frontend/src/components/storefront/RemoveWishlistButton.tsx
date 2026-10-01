"use client";

import { useTransition } from "react";
import { removeFromWishlist } from "@/lib/actions/wishlist";

export function RemoveWishlistButton({ wishlistItemId }: { wishlistItemId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => removeFromWishlist(wishlistItemId))}
      className="mt-2 text-xs font-semibold uppercase tracking-wider text-cocoa-400 underline hover:text-danger-600 disabled:opacity-50"
    >
      Remove
    </button>
  );
}
