"use server";

import { revalidatePath } from "next/cache";
import { apiServer, ApiRequestError } from "@/lib/api/server";
import { productSchema, type ProductInput } from "@/lib/validators";
import type { Category, ProductDetail, ProductListResult } from "@/lib/api/types";
import { getCollections } from "./collections";

export type ShopSort = "best-sellers" | "price-asc" | "price-desc" | "newest";

export type ShopFilters = {
  categorySlugs?: string[];
  collectionSlug?: string;
  search?: string;
  cocoaMin?: number;
  cocoaMax?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: ShopSort;
  page?: number;
  perPage?: number;
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

function withEmptyReviews(product: Omit<ProductDetail, "reviews">): ProductDetail {
  return { ...product, reviews: [] };
}

export async function getActiveProducts(filters: ShopFilters = {}) {
  const qs = buildQuery({
    category: filters.categorySlugs?.length ? filters.categorySlugs.join(",") : undefined,
    collection: filters.collectionSlug,
    search: filters.search,
    cocoa_min: filters.cocoaMin,
    cocoa_max: filters.cocoaMax,
    price_min: filters.priceMin,
    price_max: filters.priceMax,
    sort: filters.sort,
    page: filters.page ?? 1,
    per_page: filters.perPage ?? 6,
  });

  return apiServer.get<ProductListResult>(`/products${qs}`);
}

export async function getFeaturedProducts() {
  const products = await apiServer.get<Omit<ProductDetail, "reviews">[]>("/products/featured");
  return products.map(withEmptyReviews);
}

export async function getBestsellers() {
  const products = await apiServer.get<Omit<ProductDetail, "reviews">[]>("/products/bestsellers");
  return products.map(withEmptyReviews);
}

export async function getProductBySlug(slug: string) {
  const product = await apiServer.get<Omit<ProductDetail, "reviews">>(`/products/${encodeURIComponent(slug)}`);
  return withEmptyReviews(product);
}

export async function getCategories() {
  return apiServer.get<Category[]>("/categories");
}

export async function getFeaturedCollections() {
  return getCollections({ featuredOnly: true });
}

export async function getAllCollections() {
  return getCollections();
}

// ---------- Admin ----------

export async function getProductById(id: string) {
  try {
    const product = await apiServer.get<Omit<ProductDetail, "reviews">>(`/admin/products/${id}`);
    return withEmptyReviews(product);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}

export async function listProductsForAdmin() {
  const products = await apiServer.get<Omit<ProductDetail, "reviews">[]>("/admin/products");
  return products.map(withEmptyReviews);
}

function toProductInput(data: ReturnType<typeof productSchema.parse>) {
  return {
    name: data.name,
    slug: data.slug,
    shortDescription: data.shortDescription,
    description: data.description,
    categoryId: data.categoryId || null,
    cocoaPercent: data.cocoaPercent,
    ingredients: data.ingredients,
    allergens: data.allergens,
    shelfLife: data.shelfLife,
    storageInfo: data.storageInfo,
    isVegetarian: data.isVegetarian,
    isFeatured: data.isFeatured,
    isBestseller: data.isBestseller,
    isActive: data.isActive,
    images: data.images,
    variants: data.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      label: v.label,
      weightGrams: v.weightGrams,
      price: v.price,
      comparePrice: v.comparePrice,
      gstPercent: v.gstPercent,
      stock: v.stock,
      lowStockAt: v.lowStockAt,
    })),
  };
}

export async function createProduct(input: ProductInput) {
  const data = productSchema.parse(input);
  const product = await apiServer.post<ProductDetail>("/admin/products", toProductInput(data));

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return product;
}

export async function updateProduct(id: string, input: ProductInput) {
  const data = productSchema.parse(input);
  await apiServer.put<ProductDetail>(`/admin/products/${id}`, toProductInput(data));

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProduct(id: string) {
  await apiServer.delete(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await apiServer.patch(`/admin/products/${id}/active?is_active=${isActive}`);
  revalidatePath("/admin/products");
}
