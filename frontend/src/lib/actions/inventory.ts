"use server";

import { prisma } from "@/lib/prisma";
import { stockAdjustmentSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type { InventoryReason } from "@prisma/client";

export async function listInventory() {
  return prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { stock: "asc" },
  });
}

export async function getInventoryHistory(variantId: string) {
  return prisma.inventoryTransaction.findMany({
    where: { variantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function adjustStock(input: {
  variantId: string;
  change: number;
  reason: "RESTOCK" | "DAMAGED" | "MANUAL_ADJUSTMENT";
  note?: string;
}) {
  const data = stockAdjustmentSchema.parse(input);

  await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: data.variantId },
      data: { stock: { increment: data.change } },
    }),
    prisma.inventoryTransaction.create({
      data: {
        variantId: data.variantId,
        change: data.change,
        reason: data.reason,
        note: data.note,
      },
    }),
  ]);

  revalidatePath("/admin/inventory");
}

/** Called from order fulfillment/cancellation flows — keeps stock and the audit log consistent. */
export async function recordInventoryMovement(params: {
  variantId: string;
  change: number;
  reason: InventoryReason;
  orderId?: string;
}) {
  await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: params.variantId },
      data: { stock: { increment: params.change } },
    }),
    prisma.inventoryTransaction.create({
      data: {
        variantId: params.variantId,
        change: params.change,
        reason: params.reason,
        orderId: params.orderId,
      },
    }),
  ]);
}
