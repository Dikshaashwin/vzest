"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponInput } from "@/lib/validators";
import { createCoupon } from "@/lib/actions/coupons";
import { Button } from "@/components/ui/Button";

export default function NewCouponPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CouponInput>({
    resolver: zodResolver(couponSchema) as unknown as Resolver<CouponInput>,
    defaultValues: { type: "PERCENTAGE", perUserLimit: 1, isActive: true },
  });

  const onSubmit = async (values: CouponInput) => {
    setSubmitting(true);
    setError(null);
    try {
      await createCoupon(values);
      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">New Coupon</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 rounded-2xl border border-cocoa-100 bg-white p-6">
        <Field label="Code" error={errors.code?.message} {...register("code")} />

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-cocoa-700">Type</span>
          <select
            className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
            {...register("type")}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
        </label>

        <Field label="Value" type="number" step="0.01" error={errors.value?.message} {...register("value")} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Min Order Value (optional)" type="number" step="0.01" {...register("minOrderValue")} />
          <Field label="Max Discount (optional)" type="number" step="0.01" {...register("maxDiscount")} />
          <Field label="Usage Limit (optional)" type="number" {...register("usageLimit")} />
          <Field label="Per-User Limit" type="number" {...register("perUserLimit")} />
          <Field label="Starts At" type="date" {...register("startsAt")} />
          <Field label="Ends At" type="date" {...register("endsAt")} />
        </div>

        <label className="flex items-center gap-2 text-sm text-cocoa-700">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-cocoa-300" {...register("isActive")} />
          Active
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Create Coupon"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-cocoa-700">{label}</span>
      <input
        className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
