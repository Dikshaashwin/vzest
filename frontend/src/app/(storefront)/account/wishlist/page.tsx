import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";
import { RemoveWishlistButton } from "@/components/storefront/RemoveWishlistButton";

export const metadata = { title: "My Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { images: { take: 1, orderBy: { position: "asc" } }, variants: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">My Wishlist</h1>

      {items.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-cocoa-200 py-12 text-center text-sm text-cocoa-400">
          Nothing saved yet — <Link href="/shop" className="underline">browse the collection</Link>.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const image = item.product.images[0];
            const price = item.product.variants[0]?.price;
            return (
              <div key={item.id} className="rounded-2xl border border-cocoa-100 p-4">
                <Link href={`/products/${item.product.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-cocoa-50">
                    {image && <Image src={image.url} alt={item.product.name} fill className="object-cover" />}
                  </div>
                  <p className="mt-3 text-sm font-medium text-cocoa-900">{item.product.name}</p>
                  {price && <p className="text-sm text-cocoa-600">{formatINR(price)}</p>}
                </Link>
                <RemoveWishlistButton wishlistItemId={item.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
