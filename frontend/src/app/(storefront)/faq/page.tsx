import { FaqAccordion } from "@/components/storefront/FaqAccordion";

export const metadata = { title: "FAQs" };

const CATEGORIES = [
  {
    title: "Sourcing & Ingredients",
    items: [
      {
        question: "Are all Zest products genuinely single-origin?",
        answer:
          "Yes. Every single one of our chocolate bars is crafted using beans sourced from a single, specific farm estate or local micro-cooperative. We never blend or dilute our lots.",
      },
      {
        question: "What defines the 'Zest' finish in your chocolate?",
        answer:
          "Our signature Zest is a microscopic whisper of organic, cold-pressed citrus oil folded in during conching — bright enough to lift the cocoa without overpowering it.",
      },
      {
        question: "Do you use artificial emulsifiers, soy lecithin, or palm oil?",
        answer: "Never. Our bars contain only cocoa mass, cocoa butter, sugar, and natural flavourings.",
      },
    ],
  },
  {
    title: "Shipping, Temperature & Storage",
    items: [
      {
        question: "How do you protect confections from melting during shipping?",
        answer:
          "Every box is insulated with cold-pack shipping and, above 72°F (22°C), medical-grade dry ice packs, monitored against regional climate forecasts.",
      },
      {
        question: "What is the optimal temperature to store artisanal chocolate?",
        answer: "Store in a cool, dry place between 15-18°C (59-64°F), away from direct sunlight and strong odours.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Help & Support</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-cocoa-900">Frequently Asked Questions</h1>
      </div>

      <div className="mt-8">
        <FaqAccordion categories={CATEGORIES} />
      </div>
    </div>
  );
}
