import { notFound } from "next/navigation";
import { getProductById, getCategories } from "@/lib/actions/products";
import { safe } from "@/lib/safe";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    safe(() => getCategories(), []),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Edit {product.name}</h1>
      <div className="mt-6">
        <ProductForm
          productId={product.id}
          categories={categories}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            shortDescription: product.shortDescription ?? undefined,
            description: product.description ?? undefined,
            categoryId: product.category?.id ?? undefined,
            cocoaPercent: product.cocoaPercent ?? undefined,
            ingredients: product.ingredients ?? undefined,
            allergens: product.allergens ?? undefined,
            shelfLife: product.shelfLife ?? undefined,
            storageInfo: product.storageInfo ?? undefined,
            isVegetarian: product.isVegetarian,
            isFeatured: product.isFeatured,
            isBestseller: product.isBestseller,
            isActive: product.isActive,
            images: product.images.map((img) => img.url),
            variants: product.variants.map((v) => ({
              id: v.id,
              sku: v.sku,
              label: v.label,
              weightGrams: v.weightGrams ?? undefined,
              price: Number(v.price),
              comparePrice: v.comparePrice ? Number(v.comparePrice) : undefined,
              gstPercent: Number(v.gstPercent),
              stock: v.stock,
              lowStockAt: v.lowStockAt,
            })),
          }}
        />
      </div>
    </div>
  );
}
