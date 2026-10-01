"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const collectionSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

export async function listCollectionsForAdmin() {
  return prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCollection(input: CollectionInput) {
  const data = collectionSchema.parse(input);
  await prisma.collection.create({ data: { ...data, imageUrl: data.imageUrl || undefined } });
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}

export async function updateCollection(id: string, input: CollectionInput) {
  const data = collectionSchema.parse(input);
  await prisma.collection.update({ where: { id }, data: { ...data, imageUrl: data.imageUrl || undefined } });
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}

export async function deleteCollection(id: string) {
  await prisma.collection.delete({ where: { id } });
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}

export async function toggleCollectionFeatured(id: string, isFeatured: boolean) {
  await prisma.collection.update({ where: { id }, data: { isFeatured } });
  revalidatePath("/admin/collections");
}
