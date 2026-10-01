import { getCategories } from "@/lib/actions/products";
import { safe } from "@/lib/safe";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const categories = await safe(() => getCategories(), []);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">New Product</h1>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
