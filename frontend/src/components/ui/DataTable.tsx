"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import clsx from "clsx";

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
};

export function DataTable<T>({
  columns,
  rows,
  emptyMessage = "No records to show.",
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  rowKey: (row: T) => string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const sorted = (() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return -1 * sort.dir;
      if (av > bv) return 1 * sort.dir;
      return 0;
    });
  })();

  const toggleSort = (key: string) => {
    setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-cocoa-100 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cocoa-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-cocoa-400",
                  col.align === "right" ? "text-right" : "text-left"
                )}
              >
                {col.sortable ? (
                  <button onClick={() => toggleSort(col.key)} className="inline-flex items-center gap-1 hover:text-cocoa-700">
                    {col.header}
                    <ArrowUpDown size={12} />
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cocoa-50">
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-cocoa-400">
                {emptyMessage}
              </td>
            </tr>
          )}
          {sorted.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-cocoa-50/50">
              {columns.map((col) => (
                <td key={col.key} className={clsx("px-4 py-3 text-cocoa-700", col.align === "right" && "text-right")}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
