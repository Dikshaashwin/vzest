"use client";

import { useState } from "react";
import clsx from "clsx";

export function ProductInfoTabs({
  tabs,
}: {
  tabs: { label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(0);
  if (tabs.length === 0) return null;

  return (
    <div className="mt-8 border-t border-cocoa-100 pt-6">
      <div className="flex gap-6 border-b border-cocoa-100">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={clsx(
              "pb-3 text-[11px] font-semibold uppercase tracking-wider",
              active === i ? "border-b-2 border-cocoa-900 text-cocoa-900" : "text-cocoa-400 hover:text-cocoa-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4 text-sm leading-relaxed text-cocoa-600">{tabs[active].content}</div>
    </div>
  );
}
