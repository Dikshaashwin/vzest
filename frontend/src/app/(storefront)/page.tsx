import Image from "next/image";
import { getBestsellers, getFeaturedCollections } from "@/lib/actions/products";
import { safe } from "@/lib/safe";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { LinkButton } from "@/components/ui/Button";
import { NewsletterForm } from "@/components/storefront/NewsletterForm";

const HERO_IMAGE = "https://images.unsplash.com/photo-1511381939415-e44015466834?w=1600&q=80";
const ROAST_IMAGE = "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=1200&q=80";

const CURATED_SERIES = [
  {
    slug: "single-origin",
    name: "Single Origin",
    description: "Intense, pure profiles sourced directly from micro-farms in Madagascar, Ecuador and Peru.",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80",
  },
  {
    slug: "infusions-citrus",
    name: "Infusions & Citrus",
    description: "Our signature dark blocks paired with organic citrus oils, raw sea salts and forest botanicals.",
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80",
  },
  {
    slug: "atelier-truffles",
    name: "The Atelier Truffles",
    description: "Hand-rolled ganache covered in dusty roasted cocoa powder, delicate shell, creamy heart.",
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&q=80",
  },
];

export default async function HomePage() {
  const [bestsellers, collections] = await Promise.all([
    safe(() => getBestsellers(), []),
    safe(() => getFeaturedCollections(), []),
  ]);

  return (
    <div>
      <section className="relative h-[420px] w-full overflow-hidden sm:h-[520px]">
        <Image src={HERO_IMAGE} alt="Hand-tempered chocolate" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-cocoa-900/40" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="max-w-xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
            Pure provenance. Hand-tempered chocolate.
          </h1>
          <p className="mt-4 max-w-md text-sm text-cream-100">
            Discover single-origin bars curated for intense purity and crisp notes of raw
            botanicals. Crafted slowly, from stone mills to pristine packaging.
          </p>
          <LinkButton href="/shop" className="mt-6 w-fit">
            Shop the Collection
          </LinkButton>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Explore</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-cocoa-900">The Curated Series</h2>
          </div>
          <LinkButton href="/collections" variant="tertiary" withArrow>
            View All Collections
          </LinkButton>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {(collections.length > 0
            ? collections.map((c) => ({ slug: c.slug, name: c.name, description: c.description ?? "", image: CURATED_SERIES[0].image }))
            : CURATED_SERIES
          ).map((c) => (
            <a key={c.slug} href={`/collections/${c.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cocoa-50">
                <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <p className="mt-3 font-serif text-lg font-semibold text-cocoa-900">{c.name}</p>
              <p className="mt-1 text-xs text-cocoa-500">{c.description}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-cocoa-700 underline">
                Explore Collection
              </p>
            </a>
          ))}
        </div>
      </div>

      <section className="bg-cream-100 py-14">
        <blockquote className="mx-auto max-w-2xl px-4 text-center font-serif text-xl italic leading-relaxed text-cocoa-800 sm:text-2xl">
          &ldquo;An extraordinary tension of high-strength dark cocoa and bright, surprising citrus
          zest. Quite simply, the best tempered chocolate in the world.&rdquo;
          <footer className="mt-4 text-xs font-semibold uppercase tracking-wider text-cocoa-400 not-italic">
            — Vogue Confectionery
          </footer>
        </blockquote>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Our Standard</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-cocoa-900">Seasonal Favorites</h2>
        </div>
        <div className="mt-8">
          <ProductGrid
            products={bestsellers.map((p) => ({ ...p, cocoaLabel: p.cocoaPercent ? `${p.cocoaPercent}% Cocoa` : undefined }))}
            emptyMessage="Mark products as bestsellers in the admin panel to feature them here."
          />
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Our Philosophy</p>
          <h2 className="mt-1 font-serif text-2xl font-bold leading-snug text-cocoa-900 sm:text-3xl">
            Roasting is our signature, Zest is our spirit.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cocoa-500">
            We believe that chocolate is alive. It contains stories of rainforest soil, misty
            mornings on small family-owned groves, and the patient hands of farmers.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cocoa-500">
            By roasting slowly in custom-lined cast iron drums, we preserve the complex acidity of
            pure cocoa. We complete the experience with a delicate thread of pure citrus essence —
            our signature Zest.
          </p>
          <LinkButton href="/about" variant="secondary" className="mt-6 w-fit">
            Read the Atelier Story
          </LinkButton>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cocoa-50">
          <Image src={ROAST_IMAGE} alt="Chocolate roasting process" fill className="object-cover" />
        </div>
      </section>

      <section className="border-t border-cocoa-100 bg-cream-100 py-14">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-bold text-cocoa-900">Join the Batch Releases</h2>
          <p className="mt-2 text-sm text-cocoa-500">
            Subscribers receive early access to our seasonal single-estate micro-lots, private
            culinary chocolate tastings, and seasonal recipe journals.
          </p>
          <NewsletterForm className="mt-6" />
        </div>
      </section>
    </div>
  );
}
