import { ProductCard, type ProductCardData } from "./ProductCard";

export function ProductGrid({
  title,
  subtitle,
  products,
  emptyMessage = "No products to show yet.",
}: {
  title?: string;
  subtitle?: string;
  products: ProductCardData[];
  emptyMessage?: string;
}) {
  return (
    <section>
      {title && (
        <div className="mb-6 text-center">
          <h2 className="font-serif text-2xl font-bold text-cocoa-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-cocoa-400">{subtitle}</p>}
        </div>
      )}

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-cocoa-200 py-12 text-center text-sm text-cocoa-400">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
