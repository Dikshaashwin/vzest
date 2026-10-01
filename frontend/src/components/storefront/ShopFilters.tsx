"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/Checkbox";

type Category = { slug: string; name: string };

const COCOA_OPTIONS = [
  { value: "70-75", label: "70% – 75%" },
  { value: "75-85", label: "75% – 85%" },
  { value: "85-100", label: "85% – 100%" },
];

const PRICE_OPTIONS = [
  { value: "under-15", label: "Under $15" },
  { value: "15-30", label: "$15 – $30" },
  { value: "30-60", label: "$30 – $60" },
  { value: "over-60", label: "Over $60" },
];

export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const selectedPrice = searchParams.get("price");
  const selectedCocoa = searchParams.get("cocoa");
  const hasFilters = selectedCategories.length > 0 || selectedPrice || selectedCocoa;

  const updateParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const toggleCategory = (slug: string) => {
    updateParams((params) => {
      const next = selectedCategories.includes(slug)
        ? selectedCategories.filter((c) => c !== slug)
        : [...selectedCategories, slug];
      if (next.length > 0) params.set("category", next.join(","));
      else params.delete("category");
    });
  };

  const setSingle = (key: "price" | "cocoa", value: string) => {
    updateParams((params) => {
      if (params.get(key) === value) params.delete(key);
      else params.set(key, value);
    });
  };

  const clearAll = () => router.push(pathname);

  return (
    <aside className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-cocoa-900">Filters</p>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-cocoa-400 underline hover:text-cocoa-700">
            Clear All
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Category</p>
          <div className="space-y-2">
            {categories.map((c) => (
              <Checkbox
                key={c.slug}
                label={c.name}
                checked={selectedCategories.includes(c.slug)}
                onChange={() => toggleCategory(c.slug)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Cocoa Percentage</p>
        <div className="space-y-2">
          {COCOA_OPTIONS.map((o) => (
            <Checkbox
              key={o.value}
              label={o.label}
              checked={selectedCocoa === o.value}
              onChange={() => setSingle("cocoa", o.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Price Range</p>
        <div className="space-y-2">
          {PRICE_OPTIONS.map((o) => (
            <Checkbox
              key={o.value}
              label={o.label}
              checked={selectedPrice === o.value}
              onChange={() => setSingle("price", o.value)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
