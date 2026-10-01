"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function getStoreSettings() {
  const existing = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  if (existing) return existing;
  return prisma.storeSettings.create({ data: { id: "singleton" } });
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
  await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  revalidatePath("/admin/settings");
}
