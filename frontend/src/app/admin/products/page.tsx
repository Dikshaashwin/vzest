import Link from "next/link";
import { Plus } from "lucide-react";
import { listProductsForAdmin } from "@/lib/actions/products";
import { safe } from "@/lib/safe";
import { formatINR } from "@/lib/format";
import { LinkButton } from "@/components/ui/Button";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await safe(() => listProductsForAdmin(), []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-cocoa-900">Products</h1>
        <LinkButton href="/admin/products/new">
          <Plus size={16} /> New Product
        </LinkButton>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs text-cocoa-400">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Variants</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50">
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-cocoa-400">
                  No products yet. Create your first one.
                </td>
              </tr>
            )}
            {products.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              const minPrice = product.variants.reduce(
                (min, v) => (min === null || Number(v.price) < min ? Number(v.price) : min),
                null as number | null
              );
              return (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-medium text-cocoa-800">
                    <Link href={`/admin/products/${product.id}/edit`} className="hover:underline">
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-cocoa-500">{product.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-cocoa-500">{product.variants.length}</td>
                  <td className="px-4 py-3 text-cocoa-500">{totalStock}</td>
                  <td className="px-4 py-3 text-cocoa-700">
                    {minPrice !== null ? formatINR(minPrice) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={product.isActive ? "success" : "neutral"}>
                      {product.isActive ? "Active" : "Hidden"}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <ProductRowActions productId={product.id} isActive={product.isActive} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
