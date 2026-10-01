"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { apiServer } from "@/lib/api/server";

export type StoreSettings = {
  storeName: string;
  domain: string | null;
  timezone: string;
  currency: string;
  contactEmail: string | null;
  instagramHandle: string | null;
};

export async function getStoreSettings() {
  return apiServer.get<StoreSettings>("/admin/settings");
}

const settingsSchema = z.object({
  storeName: z.string().min(2),
  domain: z.string().optional(),
  timezone: z.string().min(2),
  currency: z.string().min(2),
  contactEmail: z.string().email().optional().or(z.literal("")),
  instagramHandle: z.string().optional(),
});

export async function updateStoreSettings(input: z.infer<typeof settingsSchema>) {
  const data = settingsSchema.parse(input);
  await apiServer.put("/admin/settings", data);
  revalidatePath("/admin/settings");
}
