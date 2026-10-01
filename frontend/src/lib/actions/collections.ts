"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { apiServer } from "@/lib/api/server";
import type { Collection, CollectionAdmin } from "@/lib/api/types";

const collectionSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

export async function getCollections(opts: { featuredOnly?: boolean } = {}) {
  const qs = opts.featuredOnly ? "?featured_only=true" : "";
  return apiServer.get<Collection[]>(`/collections${qs}`);
}

export async function getCollectionBySlug(slug: string) {
  return apiServer.get<Collection>(`/collections/${encodeURIComponent(slug)}`);
}

export async function listCollectionsForAdmin() {
  const collections = await apiServer.get<CollectionAdmin[]>("/admin/collections");
  return collections.map((c) => ({ ...c, _count: { products: c.productCount } }));
}

function toCollectionInput(data: CollectionInput) {
  return { ...data, imageUrl: data.imageUrl || null };
}

export async function createCollection(input: CollectionInput) {
  const data = collectionSchema.parse(input);
  await apiServer.post("/admin/collections", toCollectionInput(data));
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}

export async function updateCollection(id: string, input: CollectionInput) {
  const data = collectionSchema.parse(input);
  await apiServer.put(`/admin/collections/${id}`, toCollectionInput(data));
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}

export async function deleteCollection(id: string) {
  await apiServer.delete(`/admin/collections/${id}`);
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}

export async function toggleCollectionFeatured(id: string, isFeatured: boolean) {
  // The backend has no single-collection admin GET, and PUT replaces the full
  // record — so we pull the current fields from the list first.
  const collections = await apiServer.get<CollectionAdmin[]>("/admin/collections");
  const collection = collections.find((c) => c.id === id);
  if (!collection) throw new Error("Collection not found");

  await apiServer.put(`/admin/collections/${id}`, {
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? undefined,
    imageUrl: collection.imageUrl,
    isFeatured,
  });
  revalidatePath("/admin/collections");
}
