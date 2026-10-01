"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validators";
import { slugify } from "@/lib/format";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";

type Category = { id: string; name: string };

export function ProductForm({
  productId,
  categories,
  defaultValues,
}: {
  productId?: string;
  categories: Category[];
  defaultValues?: Partial<ProductInput>;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrlsText, setImageUrlsText] = useState((defaultValues?.images ?? []).join("\n"));

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductInput>,
    defaultValues: {
      isActive: true,
      isVegetarian: true,
      isFeatured: false,
      isBestseller: false,
      variants: [{ sku: "", label: "", price: 0, gstPercent: 18, stock: 0, lowStockAt: 10 }],
      images: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const name = watch("name");

  const onSubmit = async (values: ProductInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const images = imageUrlsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = { ...values, images };

      if (productId) {
        await updateProduct(productId, payload);
      } else {
        await createProduct(payload);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
      <section className="space-y-4 rounded-2xl border border-cocoa-100 bg-white p-6">
        <h2 className="text-sm font-semibold text-cocoa-800">Basic Details</h2>

        <TextField label="Product Name" error={errors.name?.message} {...register("name")} />

        <div className="flex items-end gap-2">
          <TextField
            label="Slug"
            error={errors.slug?.message}
            {...register("slug")}
            wrapperClassName="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setValue("slug", slugify(name ?? ""))}
          >
            Generate
          </Button>
        </div>

        <TextField label="Short Description" {...register("shortDescription")} />

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-cocoa-700">Full Description</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
            {...register("description")}
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-cocoa-700">Category</span>
          <select
            className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
            {...register("categoryId")}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <TextField label="Cocoa %" type="number" min={0} max={100} {...register("cocoaPercent")} />
          <TextField label="Ingredients" {...register("ingredients")} />
          <TextField label="Allergens" {...register("allergens")} />
          <TextField label="Shelf Life" placeholder="e.g. 6 months" {...register("shelfLife")} />
          <TextField label="Storage Info" placeholder="e.g. Cool, dry place" {...register("storageInfo")} />
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <Checkbox label="Vegetarian" {...register("isVegetarian")} />
          <Checkbox label="Featured" {...register("isFeatured")} />
          <Checkbox label="Bestseller" {...register("isBestseller")} />
          <Checkbox label="Active (visible on site)" {...register("isActive")} />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-cocoa-100 bg-white p-6">
        <h2 className="text-sm font-semibold text-cocoa-800">Images</h2>
        <p className="text-xs text-cocoa-400">
          One image URL per line. Swap this for a real upload widget once Supabase Storage /
          Cloudinary keys are configured.
        </p>
        <textarea
          rows={3}
          value={imageUrlsText}
          onChange={(e) => setImageUrlsText(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-cocoa-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cocoa-800">Variants</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({ sku: "", label: "", price: 0, gstPercent: 18, stock: 0, lowStockAt: 10 })
            }
          >
            <Plus size={14} /> Add Variant
          </Button>
        </div>

        {errors.variants?.message && <p className="text-sm text-red-600">{errors.variants.message}</p>}

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-2 gap-3 rounded-xl bg-cocoa-50 p-4 sm:grid-cols-4">
            <TextField label="SKU" {...register(`variants.${index}.sku`)} />
            <TextField label="Label (e.g. 100g)" {...register(`variants.${index}.label`)} />
            <TextField label="Price (₹)" type="number" step="0.01" {...register(`variants.${index}.price`)} />
            <TextField
              label="Compare Price (₹)"
              type="number"
              step="0.01"
              {...register(`variants.${index}.comparePrice`)}
            />
            <TextField label="Weight (g)" type="number" {...register(`variants.${index}.weightGrams`)} />
            <TextField label="GST %" type="number" step="0.01" {...register(`variants.${index}.gstPercent`)} />
            <TextField label="Stock" type="number" {...register(`variants.${index}.stock`)} />
            <TextField label="Low Stock At" type="number" {...register(`variants.${index}.lowStockAt`)} />
            <div className="col-span-full flex justify-end">
              <button
                type="button"
                onClick={() => remove(index)}
                className="flex items-center gap-1 text-xs text-red-600 hover:underline"
              >
                <Trash2 size={12} /> Remove variant
              </button>
            </div>
          </div>
        ))}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : productId ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}

function TextField({
  label,
  error,
  wrapperClassName,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  wrapperClassName?: string;
}) {
  return (
    <label className={`block text-sm ${wrapperClassName ?? ""}`}>
      <span className="mb-1 block font-medium text-cocoa-700">{label}</span>
      <input
        className="w-full rounded-lg border border-cocoa-200 px-3 py-2 focus:border-cocoa-800 focus:outline-none"
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Checkbox({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-cocoa-700">
      <input type="checkbox" className="h-4 w-4 rounded border-cocoa-300" {...props} />
      {label}
    </label>
  );
}
