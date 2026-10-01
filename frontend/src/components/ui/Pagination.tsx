import Link from "next/link";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const items: (number | "ellipsis")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("ellipsis");
    items.push(p);
  });

  const cell = "flex h-9 w-9 items-center justify-center rounded border text-sm font-medium";

  return (
    <nav className="flex items-center justify-center gap-2">
      <Link
        href={pageHref(basePath, Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={clsx(cell, "border-cocoa-200 text-cocoa-600", page === 1 && "pointer-events-none opacity-30")}
      >
        <ChevronLeft size={16} />
      </Link>

      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span key={`e-${i}`} className="px-1 text-cocoa-400">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(basePath, item)}
            className={clsx(
              cell,
              item === page
                ? "border-cocoa-900 bg-cocoa-900 text-white"
                : "border-cocoa-200 text-cocoa-700 hover:border-cocoa-800"
            )}
          >
            {item}
          </Link>
        )
      )}

      <Link
        href={pageHref(basePath, Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={clsx(cell, "border-cocoa-200 text-cocoa-600", page === totalPages && "pointer-events-none opacity-30")}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
