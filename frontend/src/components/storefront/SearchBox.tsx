"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBox({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 rounded border border-cocoa-200 bg-cream-100 px-4 py-3">
      <Search size={18} className="text-cocoa-400" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search confections..."
        autoFocus
        className="w-full bg-transparent text-sm text-cocoa-900 placeholder:text-cocoa-400 focus:outline-none"
      />
      {value && (
        <button type="button" onClick={() => setValue("")} aria-label="Clear search" className="text-cocoa-300 hover:text-cocoa-700">
          <X size={16} />
        </button>
      )}
    </form>
  );
}
