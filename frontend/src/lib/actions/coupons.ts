"use server";

import { prisma } from "@/lib/prisma";
import { couponSchema, type CouponInput } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.isActive) return { valid: false as const, error: "Invalid or expired coupon code." };

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) return { valid: false as const, error: "This coupon is not active yet." };
  if (coupon.endsAt && now > coupon.endsAt) return { valid: false as const, error: "This coupon has expired." };
  if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
    return { valid: false as const, error: `Minimum order value is ₹${coupon.minOrderValue}.` };
  }

  let discount = coupon.type === "PERCENTAGE" ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);
  if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));

  return { valid: true as const, code: coupon.code, discount };
}

export async function listCoupons() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { usages: true } } } });
}

export async function createCoupon(input: CouponInput) {
  const data = couponSchema.parse(input);
  await prisma.coupon.create({
    data: {
      code: data.code,
      type: data.type,
      value: data.value,
      minOrderValue: data.minOrderValue,
      maxDiscount: data.maxDiscount,
      usageLimit: data.usageLimit,
      perUserLimit: data.perUserLimit,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      isActive: data.isActive,
    },
  });
  revalidatePath("/admin/coupons");
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}
