import { getActiveProducts } from "@/lib/actions/products";
import { safe } from "@/lib/safe";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { prisma } from "@/lib/prisma";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [collection, { products }] = await Promise.all([
    safe(() => prisma.collection.findUnique({ where: { slug } }), null),
    safe(() => getActiveProducts({ collectionSlug: slug, perPage: 24 }), { products: [], total: 0, totalPages: 1 }),
  ]);

  const title = collection?.name ?? slug.replaceAll("-", " ");
  const cards = products.map((p) => ({ ...p, cocoaLabel: p.cocoaPercent ? `${p.cocoaPercent}% Cocoa` : undefined }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold capitalize text-cocoa-900">{title}</h1>
      {collection?.description && <p className="mt-2 max-w-xl text-cocoa-500">{collection.description}</p>}

      <div className="mt-10">
        <ProductGrid
          products={cards}
          emptyMessage="No products in this collection yet — assign products to it from the admin panel."
        />
      </div>
    </div>
  );
}
