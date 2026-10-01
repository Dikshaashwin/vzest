"use server";

import { revalidatePath } from "next/cache";
import { apiServer, ApiRequestError } from "@/lib/api/server";
import type { WishlistItem } from "@/lib/api/types";

export async function getWishlist() {
  try {
    return await apiServer.get<WishlistItem[]>("/account/wishlist");
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return [];
    throw err;
  }
}

export async function toggleWishlist(productId: string) {
  try {
    const result = await apiServer.post<{ wishlisted: boolean }>(`/account/wishlist/${productId}/toggle`);
    revalidatePath("/account/wishlist");
    return result;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) {
      throw new Error("You must be signed in to save items.");
    }
    throw err;
  }
}

export async function removeFromWishlist(wishlistItemId: string) {
  try {
    await apiServer.delete(`/account/wishlist/${wishlistItemId}`);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) {
      throw new Error("You must be signed in.");
    }
    throw err;
  }
  revalidatePath("/account/wishlist");
}
