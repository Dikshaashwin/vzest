"use server";

import { prisma } from "@/lib/prisma";
import { productSchema, type ProductInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

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

const PRODUCT_INCLUDE = {
  images: { orderBy: { position: "asc" as const } },
  variants: true,
  category: true,
} satisfies Prisma.ProductInclude;

export async function getActiveProducts(filters: ShopFilters = {}) {
  const { categorySlugs, collectionSlug, search, cocoaMin, cocoaMax, sort, page = 1, perPage = 6 } = filters;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    category: categorySlugs?.length ? { slug: { in: categorySlugs } } : undefined,
    collections: collectionSlug ? { some: { collection: { slug: collectionSlug } } } : undefined,
    name: search ? { contains: search, mode: "insensitive" } : undefined,
    cocoaPercent:
      cocoaMin !== undefined || cocoaMax !== undefined
        ? { gte: cocoaMin ?? 0, lte: cocoaMax ?? 100 }
        : undefined,
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "newest" ? { createdAt: "desc" } : sort === "best-sellers" ? { isBestseller: "desc" } : { createdAt: "desc" };

  let products = await prisma.product.findMany({ where, include: PRODUCT_INCLUDE, orderBy });

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    products = products.filter((p) => {
      const min = Math.min(...p.variants.map((v) => Number(v.price)));
      if (filters.priceMin !== undefined && min < filters.priceMin) return false;
      if (filters.priceMax !== undefined && min > filters.priceMax) return false;
      return true;
    });
  }

  if (sort === "price-asc" || sort === "price-desc") {
    products = [...products].sort((a, b) => {
      const aMin = Math.min(...a.variants.map((v) => Number(v.price)));
      const bMin = Math.min(...b.variants.map((v) => Number(v.price)));
      return sort === "price-asc" ? aMin - bMin : bMin - aMin;
    });
  }

  const total = products.length;
  const start = (page - 1) * perPage;
  const paged = products.slice(start, start + perPage);

  return { products: paged, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: PRODUCT_INCLUDE,
    take: 8,
  });
}

export async function getBestsellers() {
  return prisma.product.findMany({
    where: { isActive: true, isBestseller: true },
    include: PRODUCT_INCLUDE,
    take: 8,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { where: { isActive: true } },
      category: true,
      reviews: { where: { isApproved: true }, include: { user: true } },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getFeaturedCollections() {
  return prisma.collection.findMany({ where: { isFeatured: true }, orderBy: { name: "asc" } });
}

export async function getAllCollections() {
  return prisma.collection.findMany({ orderBy: { name: "asc" } });
}

// ---------- Admin ----------

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, variants: true, category: true },
  });
}

export async function listProductsForAdmin() {
  return prisma.product.findMany({
    include: { variants: true, category: true, images: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createProduct(input: ProductInput) {
  const data = productSchema.parse(input);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      shortDescription: data.shortDescription,
      description: data.description,
      categoryId: data.categoryId || undefined,
      cocoaPercent: data.cocoaPercent,
      ingredients: data.ingredients,
      allergens: data.allergens,
      shelfLife: data.shelfLife,
      storageInfo: data.storageInfo,
      isVegetarian: data.isVegetarian,
      isFeatured: data.isFeatured,
      isBestseller: data.isBestseller,
      isActive: data.isActive,
      images: { create: data.images.map((url, position) => ({ url, position })) },
      variants: {
        create: data.variants.map((v) => ({
          sku: v.sku,
          label: v.label,
          weightGrams: v.weightGrams,
          price: v.price,
          comparePrice: v.comparePrice,
          gstPercent: v.gstPercent,
          stock: v.stock,
          lowStockAt: v.lowStockAt,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return product;
}

export async function updateProduct(id: string, input: ProductInput) {
  const data = productSchema.parse(input);

  await prisma.$transaction([
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        categoryId: data.categoryId || undefined,
        cocoaPercent: data.cocoaPercent,
        ingredients: data.ingredients,
        allergens: data.allergens,
        shelfLife: data.shelfLife,
        storageInfo: data.storageInfo,
        isVegetarian: data.isVegetarian,
        isFeatured: data.isFeatured,
        isBestseller: data.isBestseller,
        isActive: data.isActive,
        images: { create: data.images.map((url, position) => ({ url, position })) },
      },
    }),
  ]);

  for (const variant of data.variants) {
    if (variant.id) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          sku: variant.sku,
          label: variant.label,
          weightGrams: variant.weightGrams,
          price: variant.price,
          comparePrice: variant.comparePrice,
          gstPercent: variant.gstPercent,
          lowStockAt: variant.lowStockAt,
        },
      });
    } else {
      await prisma.productVariant.create({
        data: {
          productId: id,
          sku: variant.sku,
          label: variant.label,
          weightGrams: variant.weightGrams,
          price: variant.price,
          comparePrice: variant.comparePrice,
          gstPercent: variant.gstPercent,
          stock: variant.stock,
          lowStockAt: variant.lowStockAt,
        },
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/products");
}
