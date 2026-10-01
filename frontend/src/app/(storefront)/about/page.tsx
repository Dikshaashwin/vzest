import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";

export const metadata = { title: "Our Story" };

const HERO_IMAGE = "https://images.unsplash.com/photo-1511381939415-e44015466834?w=1600&q=80";
const FOUNDER_IMAGE = "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800&q=80";

const PROCESS = [
  { step: "Step 01", title: "Pure Sourcing", description: "Wild-harvested, hand-selected heirloom cacao and Trinitario pods directly from single-family estates." },
  { step: "Step 02", title: "Iron Drum Roasting", description: "Roasted slowly in cast-iron vintage drums to lock in deep botanical oils and unique origin profiles." },
  { step: "Step 03", title: "Stone Mill Conching", description: "Milled slowly under granite stones for 72 hours until glassine, silken smooth." },
  { step: "Step 04", title: "Signature Zest", description: "Finished with a microscopic whisper of organic citrus oils and cold-pressed botanical essences." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[320px] w-full overflow-hidden sm:h-[420px]">
        <Image src={HERO_IMAGE} alt="Cocoa roasting" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-cocoa-900/45" />
        <div className="relative mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Crafted with intention. Tempered with patience.</h1>
          <p className="mt-3 max-w-xl text-sm text-cream-100">
            The story of Zest begins at the origin — where soil, sun, and dedicated micro-growers
            converge to create the world&apos;s most intense, untempered cacao.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cocoa-50">
          <Image src={FOUNDER_IMAGE} alt="Zest founder" fill className="object-cover" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Our Provenance</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-cocoa-900 sm:text-3xl">
            Reclaiming the purity of cocoa, one single-farm bean at a time.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cocoa-500">
            We started Zest because we noticed something missing in modern confectionery.
            Commercial processes strip away the genuine acidity, complex fruit, and raw botanical
            tannins that make real cocoa beautiful.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cocoa-500">
            Our journey takes us directly to remote cooperatives in Madagascar, Peru, and Ecuador.
            We seek face-to-face with micro-farms, ensuring ethical direct trade and pure micro-lot
            shipments. Then, we craft each bar in our stone-grinding atelier in small, hand-tempered
            batches.
          </p>
        </div>
      </section>

      <section className="border-t border-cocoa-100 bg-cream-100 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">The Method</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-cocoa-900">From Forest to Bar</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <div key={p.step} className="rounded-2xl border border-cocoa-100 bg-white p-5 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-600">{p.step}</p>
                <p className="mt-2 font-serif text-lg font-semibold text-cocoa-900">{p.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-cocoa-500">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cocoa-900 py-16 text-center text-white">
        <blockquote className="mx-auto max-w-2xl px-4 font-serif text-xl italic leading-relaxed sm:text-2xl">
          &ldquo;We believe that chocolate is alive. It contains stories of rainforest soil, misty
          mornings on small family-owned groves, and the patient hands of master farmers.&rdquo;
        </blockquote>
        <div className="mx-auto mt-8 grid max-w-3xl gap-6 px-4 text-xs uppercase tracking-wider text-cocoa-200 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-white">Provenance First</p>
            <p className="mt-1 normal-case tracking-normal text-cocoa-300">No blends. Every bar traces back to a single estate.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Preservation Trade</p>
            <p className="mt-1 normal-case tracking-normal text-cocoa-300">We elevate the farmate direct back to farm cooperatives.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Botanical Honesty</p>
            <p className="mt-1 normal-case tracking-normal text-cocoa-300">100% organic ingredients. Free from artificial emulsifiers or soy.</p>
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-cocoa-900">Experience the Origin Series</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-cocoa-500">
          Secure early access to our seasonal single-estate micro-lots and small hand-tempered batches.
        </p>
        <LinkButton href="/shop" className="mt-6">
          Shop the Collection
        </LinkButton>
      </section>
    </div>
  );
}
