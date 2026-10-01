"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import clsx from "clsx";

type FaqItem = { question: string; answer: string };
type FaqCategory = { title: string; items: FaqItem[] };

export function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return categories;
    const q = query.toLowerCase();
    return categories
      .map((cat) => ({ ...cat, items: cat.items.filter((i) => i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q)) }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, query]);

  return (
    <div>
      <div className="flex items-center gap-3 rounded border border-cocoa-200 bg-cream-100 px-4 py-3">
        <Search size={18} className="text-cocoa-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Have a question? Try searching here..."
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      <div className="mt-10 space-y-8">
        {filtered.length === 0 && <p className="text-center text-sm text-cocoa-400">No matching questions.</p>}
        {filtered.map((cat) => (
          <div key={cat.title}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">{cat.title}</p>
            <div className="mt-3 divide-y divide-cocoa-100 border-t border-cocoa-100">
              {cat.items.map((item) => {
                const key = `${cat.title}-${item.question}`;
                const open = openKey === key;
                return (
                  <div key={key}>
                    <button
                      onClick={() => setOpenKey(open ? null : key)}
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span className="font-serif text-lg text-cocoa-900">{item.question}</span>
                      <ChevronDown size={18} className={clsx("flex-shrink-0 text-cocoa-500 transition-transform", open && "rotate-180")} />
                    </button>
                    {open && <p className="pb-4 text-sm leading-relaxed text-cocoa-500">{item.answer}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
