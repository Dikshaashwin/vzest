import { listInventory } from "@/lib/actions/inventory";
import { safe } from "@/lib/safe";
import { StockAdjustButton } from "@/components/admin/StockAdjustButton";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";

export const metadata = { title: "Inventory" };

function stockStatus(stock: number, lowStockAt: number): { label: string; tone: BadgeTone } {
  if (stock === 0) return { label: "Out of Stock", tone: "danger" };
  if (stock <= lowStockAt) return { label: "Low Stock", tone: "warning" };
  return { label: "In Stock", tone: "success" };
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const variants = await safe(() => listInventory(), []);

  const filtered = variants.filter((v) => {
    if (filter === "low") return v.stock > 0 && v.stock <= v.lowStockAt;
    if (filter === "out") return v.stock === 0;
    if (filter === "in") return v.stock > v.lowStockAt;
    return true;
  });

  const tabs = [
    { key: undefined, label: "All" },
    { key: "in", label: "In Stock" },
    { key: "low", label: "Low Stock" },
    { key: "out", label: "Out of Stock" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Inventory</h1>

      <div className="mt-4 flex gap-2">
        {tabs.map((tab) => (
          <a
            key={tab.label}
            href={tab.key ? `/admin/inventory?filter=${tab.key}` : "/admin/inventory"}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === tab.key ? "bg-cocoa-800 text-white" : "bg-white text-cocoa-600 hover:bg-cocoa-100"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs text-cocoa-400">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-cocoa-400">
                  No variants match this filter.
                </td>
              </tr>
            )}
            {filtered.map((variant) => {
              const status = stockStatus(variant.stock, variant.lowStockAt);
              return (
                <tr key={variant.id}>
                  <td className="px-4 py-3 font-medium text-cocoa-800">
                    {variant.product.name} <span className="text-cocoa-400">({variant.label})</span>
                  </td>
                  <td className="px-4 py-3 text-cocoa-500">{variant.sku}</td>
                  <td className="px-4 py-3 text-cocoa-700">{variant.stock}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StockAdjustButton variantId={variant.id} />
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
