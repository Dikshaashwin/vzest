import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(2, "SKU is required"),
  label: z.string().min(1, "Variant label is required"),
  weightGrams: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  comparePrice: z.coerce.number().positive().optional(),
  gstPercent: z.coerce.number().min(0).max(100).default(18),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockAt: z.coerce.number().int().min(0).default(10),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  cocoaPercent: z.coerce.number().int().min(0).max(100).optional(),
  ingredients: z.string().optional(),
  allergens: z.string().optional(),
  shelfLife: z.string().optional(),
  storageInfo: z.string().optional(),
  isVegetarian: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url()).default([]),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
});

export type ProductInput = z.infer<typeof productSchema>;

export const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10).max(15),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4).max(10),
});

export const checkoutSchema = z.object({
  address: addressSchema,
  couponCode: z.string().optional(),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  usageLimit: z.coerce.number().int().min(0).optional(),
  perUserLimit: z.coerce.number().int().min(1).default(1),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;

export const stockAdjustmentSchema = z.object({
  variantId: z.string(),
  change: z.coerce.number().int(),
  reason: z.enum(["RESTOCK", "DAMAGED", "MANUAL_ADJUSTMENT"]),
  note: z.string().optional(),
});
