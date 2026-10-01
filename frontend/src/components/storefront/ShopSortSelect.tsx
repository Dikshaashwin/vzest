"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ShopSort } from "@/lib/actions/products";

const OPTIONS: { value: ShopSort; label: string }[] = [
  { value: "best-sellers", label: "Best Sellers" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ShopSortSelect({ current }: { current?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-cocoa-500">
      <label htmlFor="sort" className="hidden sm:inline">
        Sort by:
      </label>
      <select
        id="sort"
        defaultValue={current ?? "best-sellers"}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded border border-cocoa-200 bg-white px-3 py-1.5 text-sm text-cocoa-800 focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
