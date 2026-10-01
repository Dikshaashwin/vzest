import Image from "next/image";
import Link from "next/link";
import { getAllCollections } from "@/lib/actions/products";
import { safe } from "@/lib/safe";

export const metadata = { title: "Collections" };

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80";

export default async function CollectionsPage() {
  const collections = await safe(() => getAllCollections(), []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-cocoa-900">Collections</h1>
      <p className="mt-2 max-w-xl text-cocoa-500">Curated assortments across our origins, infusions, and gifting sets.</p>

      {collections.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-cocoa-200 py-12 text-center text-sm text-cocoa-400">
          No collections yet — create some from the admin panel.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link key={c.id} href={`/collections/${c.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cocoa-50">
                <Image
                  src={c.imageUrl ?? PLACEHOLDER_IMAGE}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 font-serif text-lg font-semibold text-cocoa-900">{c.name}</p>
              {c.description && <p className="mt-1 text-xs text-cocoa-500">{c.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
