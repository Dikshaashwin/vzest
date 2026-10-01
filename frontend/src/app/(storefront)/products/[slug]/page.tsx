import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/actions/products";
import { AddToCartPanel } from "@/components/storefront/AddToCartPanel";
import { ProductInfoTabs } from "@/components/storefront/ProductInfoTabs";
import { formatDate } from "@/lib/format";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);

  if (!product) notFound();

  const primaryImage = product.images[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-cocoa-400">
        <Link href="/shop" className="hover:text-cocoa-700">Shop All</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-cocoa-700">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-cocoa-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-cocoa-50">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-cocoa-200">No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl bg-cocoa-50">
                  <Image src={img.url} alt={img.altText ?? product.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.cocoaPercent && (
              <span className="rounded-full bg-cocoa-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cocoa-700">
                {product.cocoaPercent}% Cocoa
              </span>
            )}
            {product.isBestseller && (
              <span className="rounded-full bg-cocoa-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cocoa-700">
                Best Seller
              </span>
            )}
          </div>

          <h1 className="mt-3 font-serif text-3xl font-bold text-cocoa-900">{product.name}</h1>
          {product.shortDescription && (
            <p className="mt-2 text-cocoa-500">{product.shortDescription}</p>
          )}

          <div className="mt-6">
            <AddToCartPanel
              productId={product.id}
              productName={product.name}
              image={primaryImage?.url}
              variants={product.variants}
            />
          </div>

          <ProductInfoTabs
            tabs={[
              {
                label: "The Blend",
                content: product.description ?? "Details on this blend are coming soon.",
              },
              {
                label: "Ingredients",
                content: product.ingredients ?? "Ingredient information coming soon.",
              },
              {
                label: "Origin Notes",
                content: (
                  <div className="space-y-1">
                    {product.allergens && <p>Allergens: {product.allergens}</p>}
                    {product.shelfLife && <p>Shelf life: {product.shelfLife}</p>}
                    {product.storageInfo && <p>Storage: {product.storageInfo}</p>}
                    <p>{product.isVegetarian ? "Vegetarian" : "Non-Vegetarian"}</p>
                  </div>
                ),
              },
            ]}
          />

          {product.reviews.length > 0 && (
            <div className="mt-10 border-t border-cocoa-100 pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-900">Customer Reviews</p>
              <ul className="mt-4 space-y-4">
                {product.reviews.map((review) => (
                  <li key={review.id} className="rounded-xl bg-cocoa-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-cocoa-800">{review.user.name ?? "Customer"}</span>
                      <span className="text-cocoa-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-cocoa-600">{review.comment}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
