import { getActiveProducts } from "@/lib/actions/products";
import { safe } from "@/lib/safe";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { SearchBox } from "@/components/storefront/SearchBox";
import { LinkButton } from "@/components/ui/Button";
import { PackageSearch } from "lucide-react";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const result = q
    ? await safe(() => getActiveProducts({ search: q, perPage: 24 }), { products: [], total: 0, totalPages: 1 })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <SearchBox defaultValue={q} />

      <div className="mt-10">
        {!q ? (
          <p className="text-center text-sm text-cocoa-400">Start typing to search our chocolate collection.</p>
        ) : result && result.products.length > 0 ? (
          <ProductGrid title={`Results for "${q}"`} products={result.products} />
        ) : (
          <div className="py-10 text-center">
            <PackageSearch className="mx-auto text-cocoa-200" size={48} />
            <h2 className="mt-4 font-serif text-2xl font-bold text-cocoa-900">No confections found</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-cocoa-500">
              We couldn&apos;t find any batches matching &ldquo;{q}&rdquo;. Our recipes change
              quarterly; you can explore trending favorites below.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <LinkButton href="/shop">Shop All Confections</LinkButton>
              <LinkButton href="/contact" variant="secondary">
                Speak With a Chocolatier
              </LinkButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
