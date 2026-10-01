"use server";

import { revalidatePath } from "next/cache";
import { apiServer } from "@/lib/api/server";
import { couponSchema, type CouponInput } from "@/lib/validators";

type CouponValidateResult = { valid: true; code: string; discount: number } | { valid: false; error: string };

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidateResult> {
  const result = await apiServer.post<{ valid: boolean; code: string | null; discount: string; error: string | null }>(
    "/coupons/validate",
    { code, subtotal },
  );

  if (!result.valid) {
    return { valid: false, error: result.error ?? "Invalid or expired coupon code." };
  }
  return { valid: true, code: result.code!, discount: Number(result.discount) };
}

export async function listCoupons() {
  const coupons = await apiServer.get<
    {
      id: string;
      code: string;
      type: string;
      value: string;
      minOrderValue: string | null;
      maxDiscount: string | null;
      usageLimit: number | null;
      perUserLimit: number;
      startsAt: string | null;
      endsAt: string | null;
      isActive: boolean;
      usageCount: number;
    }[]
  >("/admin/coupons");

  return coupons.map((c) => ({
    ...c,
    startsAt: c.startsAt ? new Date(c.startsAt) : null,
    endsAt: c.endsAt ? new Date(c.endsAt) : null,
    _count: { usages: c.usageCount },
  }));
}

export async function createCoupon(input: CouponInput) {
  const data = couponSchema.parse(input);
  await apiServer.post("/admin/coupons", {
    code: data.code,
    type: data.type,
    value: data.value,
    minOrderValue: data.minOrderValue,
    maxDiscount: data.maxDiscount,
    usageLimit: data.usageLimit,
    perUserLimit: data.perUserLimit,
    startsAt: data.startsAt || undefined,
    endsAt: data.endsAt || undefined,
    isActive: data.isActive,
  });
  revalidatePath("/admin/coupons");
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await apiServer.patch(`/admin/coupons/${id}/active?is_active=${isActive}`);
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await apiServer.delete(`/admin/coupons/${id}`);
  revalidatePath("/admin/coupons");
}
