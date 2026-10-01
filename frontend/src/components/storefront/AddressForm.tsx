"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type CheckoutInput } from "@/lib/validators";
import { createAddress } from "@/lib/actions/addresses";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";

type AddressFormValues = CheckoutInput["address"];

export function AddressForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) });

  const onSubmit = async (values: AddressFormValues) => {
    setError(null);
    try {
      await createAddress({ ...values, isDefault });
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-2xl border border-dashed border-cocoa-300 p-5">
      <Input label="Full Name" {...register("fullName")} error={errors.fullName?.message} />
      <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
      <Input label="Address Line 1" {...register("line1")} error={errors.line1?.message} />
      <Input label="Address Line 2 (optional)" {...register("line2")} />
      <div className="grid grid-cols-3 gap-3">
        <Input label="City" {...register("city")} error={errors.city?.message} />
        <Input label="State" {...register("state")} error={errors.state?.message} />
        <Input label="Pincode" {...register("pincode")} error={errors.pincode?.message} />
      </div>
      <Checkbox label="Set as default address" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          Save Address
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
