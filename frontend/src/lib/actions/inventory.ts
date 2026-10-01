"use server";

import { apiServer } from "@/lib/api/server";
import { stockAdjustmentSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export type InventoryVariant = {
  id: string;
  sku: string;
  label: string;
  price: string;
  stock: number;
  lowStockAt: number;
  product: { id: string; name: string };
};

export type InventoryTransaction = {
  id: string;
  change: number;
  reason: string;
  note: string | null;
  createdAt: string;
};

export async function listInventory() {
  return apiServer.get<InventoryVariant[]>("/admin/inventory");
}

export async function getInventoryHistory(variantId: string) {
  return apiServer.get<InventoryTransaction[]>(`/admin/inventory/${variantId}/history`);
}

export async function adjustStock(input: {
  variantId: string;
  change: number;
  reason: "RESTOCK" | "DAMAGED" | "MANUAL_ADJUSTMENT";
  note?: string;
}) {
  const data = stockAdjustmentSchema.parse(input);
  await apiServer.post("/admin/inventory/adjust", data);
  revalidatePath("/admin/inventory");
}
