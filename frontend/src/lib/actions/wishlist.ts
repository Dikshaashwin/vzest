"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be signed in to save items.");

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
  }

  revalidatePath("/account/wishlist");
}

export async function removeFromWishlist(wishlistItemId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be signed in.");
  await prisma.wishlistItem.deleteMany({ where: { id: wishlistItemId, userId: session.user.id } });
  revalidatePath("/account/wishlist");
}
