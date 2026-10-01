import Link from "next/link";
import { POLICIES } from "@/lib/policies";

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Atelier Policies</p>
          <nav className="mt-3 space-y-1 border-l border-cocoa-100">
            {POLICIES.map((p) => (
              <Link
                key={p.slug}
                href={`/policies/${p.slug}`}
                className="block -ml-px border-l-2 border-transparent px-4 py-2 text-sm text-cocoa-600 hover:border-cocoa-300 hover:text-cocoa-900"
              >
                {p.title}
              </Link>
            ))}
          </nav>
          <div className="mt-8 border-t border-cocoa-100 pt-4 text-xs text-cocoa-400">
            Need specialized support regarding order cancellation?
            <Link href="/contact" className="mt-1 block font-semibold text-cocoa-700 underline">
              Contact Support Directly
            </Link>
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
