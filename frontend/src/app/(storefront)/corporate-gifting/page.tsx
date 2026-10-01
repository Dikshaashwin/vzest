import Image from "next/image";
import { LeadForm } from "@/components/storefront/LeadForm";

export const metadata = { title: "Corporate Gifting" };

const HERO_IMAGE = "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=1600&q=80";

const TIERS = [
  {
    name: "Bronze Suite",
    description: "The essential single-origin introduction box.",
    price: "$48.00 / set",
    highlighted: false,
    features: ["Choice of 3 Origin Bars", "Standard Recycled Cardboard Box", "Custom Printed Logo Sleeve", "Minimum order: 50 sets"],
  },
  {
    name: "Silver Suite",
    description: "An advanced, botanical flight paired with truffles.",
    price: "$85.00 / set",
    highlighted: true,
    features: ["Choice of 4 Bars & Assorted Box of 6 Truffles", "Linen-textured Gift Box", "Custom Debossed Wax Seal with Logo", "Insulated warm weather shipping", "Minimum order: 30 sets"],
  },
  {
    name: "Gold Suite",
    description: "The absolute premium masterclass box for VIPs.",
    price: "$165.00 / set",
    highlighted: false,
    features: ["Full Origin Flight (6 Bars), Tasting Mat & Box of 12 Truffles", "Handcrafted Cedar Keepsake Box", "Bespoke Personalized Parchment Scroll insert", "Overnight temperature-controlled shipping", "No minimum order"],
  },
];

const DISCOUNTS = [
  { volume: "20 – 50 units", discount: "5% Off", card: "Free ($0.00)", embossing: "+$150 setup fee" },
  { volume: "51 – 150 units", discount: "10% Off", card: "Free ($0.00)", embossing: "Free ($0.00)" },
  { volume: "151 – 300 units", discount: "15% Off", card: "Free ($0.00)", embossing: "Free ($0.00)" },
  { volume: "300+ units", discount: "Contact for Custom Pricing", card: "Bespoke Design Included", embossing: "Free ($0.00)" },
];

export default function CorporateGiftingPage() {
  return (
    <div>
      <section className="relative h-[320px] w-full overflow-hidden sm:h-[380px]">
        <Image src={HERO_IMAGE} alt="Corporate gift boxes" fill className="object-cover" />
        <div className="absolute inset-0 bg-cocoa-900/55" />
        <div className="relative mx-auto flex h-full max-w-4xl flex-col justify-center px-4 text-white">
          <h1 className="max-w-lg font-serif text-3xl font-bold sm:text-4xl">Elevate your corporate gesture.</h1>
          <p className="mt-3 max-w-md text-sm text-cream-100">
            We translate our devotion to pure, untamed confections into custom gifting experiences
            that reflect raw luxury and immaculate taste.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">The Offerings</p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-cocoa-900">Curated Gift Packages</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl p-6 text-left ${
                tier.highlighted ? "bg-cocoa-900 text-white" : "border border-cocoa-100 text-cocoa-900"
              }`}
            >
              <p className="font-serif text-xl font-semibold">{tier.name}</p>
              <p className={`mt-1 text-sm ${tier.highlighted ? "text-cocoa-200" : "text-cocoa-500"}`}>{tier.description}</p>
              <ul className={`mt-4 flex-1 space-y-2 border-t pt-4 text-xs ${tier.highlighted ? "border-cocoa-700 text-cocoa-200" : "border-cocoa-100 text-cocoa-600"}`}>
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <p className={`mt-4 font-serif text-lg font-semibold ${tier.highlighted ? "text-gold-400" : "text-cocoa-900"}`}>{tier.price}</p>
              <a
                href="#inquire"
                className={`mt-3 rounded border py-2.5 text-center text-xs font-semibold uppercase tracking-wider ${
                  tier.highlighted ? "border-white text-white hover:bg-white hover:text-cocoa-900" : "border-cocoa-800 text-cocoa-900 hover:bg-cocoa-50"
                }`}
              >
                Inquire for {tier.name.split(" ")[0]}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-cocoa-100 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Pricing</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-cocoa-900">Volume Discount Structure</h2>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-cocoa-100 text-left">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cocoa-100 bg-cream-100 text-[11px] font-semibold uppercase tracking-wider text-cocoa-500">
                  <th className="px-4 py-3">Order Volume</th>
                  <th className="px-4 py-3">Discount %</th>
                  <th className="px-4 py-3">Custom Card</th>
                  <th className="px-4 py-3">Logo Embossing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cocoa-50">
                {DISCOUNTS.map((row) => (
                  <tr key={row.volume}>
                    <td className="px-4 py-3 font-medium text-cocoa-800">{row.volume}</td>
                    <td className="px-4 py-3 text-cocoa-600">{row.discount}</td>
                    <td className="px-4 py-3 text-cocoa-600">{row.card}</td>
                    <td className="px-4 py-3 text-cocoa-600">{row.embossing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="inquire" className="border-t border-cocoa-100 bg-cream-100 py-16">
        <div className="mx-auto max-w-lg px-4 sm:px-6">
          <h2 className="text-center font-serif text-2xl font-bold text-cocoa-900">Request a Quote</h2>
          <p className="mt-2 text-center text-sm text-cocoa-500">
            Tell us your requirements and our team will get back with options and pricing.
          </p>
          <div className="mt-6 rounded-2xl border border-cocoa-100 bg-white p-6">
            <LeadForm type="CORPORATE_GIFTING" messagePlaceholder="Tell us about quantity, occasion, and timeline" />
          </div>
        </div>
      </section>
    </div>
  );
}
