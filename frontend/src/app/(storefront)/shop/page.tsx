import { getActiveProducts, getCategories } from "@/lib/actions/products";
import { safe } from "@/lib/safe";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ShopFilters } from "@/components/storefront/ShopFilters";
import { ShopSortSelect } from "@/components/storefront/ShopSortSelect";
import { Pagination } from "@/components/ui/Pagination";
import type { ShopSort } from "@/lib/actions/products";

export const metadata = { title: "All Confections" };

const PRICE_BUCKETS: Record<string, { min?: number; max?: number }> = {
  "under-15": { max: 15 },
  "15-30": { min: 15, max: 30 },
  "30-60": { min: 30, max: 60 },
  "over-60": { min: 60 },
};

const COCOA_BUCKETS: Record<string, { min: number; max: number }> = {
  "70-75": { min: 70, max: 75 },
  "75-85": { min: 75, max: 85 },
  "85-100": { min: 85, max: 100 },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    price?: string;
    cocoa?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const categorySlugs = params.category?.split(",").filter(Boolean);
  const priceBucket = params.price ? PRICE_BUCKETS[params.price] : undefined;
  const cocoaBucket = params.cocoa ? COCOA_BUCKETS[params.cocoa] : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ products, total, totalPages }, categories] = await Promise.all([
    safe(
      () =>
        getActiveProducts({
          categorySlugs,
          priceMin: priceBucket?.min,
          priceMax: priceBucket?.max,
          cocoaMin: cocoaBucket?.min,
          cocoaMax: cocoaBucket?.max,
          sort: params.sort as ShopSort | undefined,
          page,
        }),
      { products: [], total: 0, totalPages: 1 }
    ),
    safe(() => getCategories(), []),
  ]);

  const cards = products.map((p) => ({
    ...p,
    cocoaLabel: p.cocoaPercent ? `${p.cocoaPercent}% Cocoa` : undefined,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">The Atelier Collection</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-cocoa-900">All Confections</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <ShopFilters categories={categories} />

        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-cocoa-500">Showing {total} premium confections</p>
            <ShopSortSelect current={params.sort} />
          </div>

          <div className="mt-6">
            <ProductGrid products={cards} emptyMessage="No products match these filters yet." />
          </div>

          <div className="mt-10">
            <Pagination page={page} totalPages={totalPages} basePath="/shop" />
          </div>
        </div>
      </div>
    </div>
  );
}
