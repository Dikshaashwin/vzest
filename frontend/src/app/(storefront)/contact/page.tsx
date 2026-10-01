import Image from "next/image";
import Link from "next/link";
import { LeadForm } from "@/components/storefront/LeadForm";

export const metadata = { title: "Contact Us" };

const MAP_IMAGE = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Connect</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-cocoa-900">Get in Touch with Zest</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-serif text-xl font-semibold text-cocoa-900">Send a Message</h2>
          <div className="mt-4">
            <LeadForm type="CONTACT" messagePlaceholder="Tell us about your culinary project, event or gifting requirements..." showSubject />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-cream-100 p-6">
            <h3 className="font-serif text-lg font-semibold text-cocoa-900">The Zest Atelier</h3>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Address</p>
                <p className="mt-1 text-cocoa-600">248 Chocolate Row, Suite A, San Francisco, CA 94107</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Hours</p>
                <p className="mt-1 text-cocoa-600">Monday — Friday: 10:00 AM – 6:00 PM</p>
                <p className="text-cocoa-600">Saturday: 11:00 AM – 4:00 PM (By Appointment Only)</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Contact</p>
                <p className="mt-1 text-cocoa-600">Tel: +1 (415) 555-0192</p>
                <p className="text-cocoa-600">Email: hello@zestchocolates.com</p>
              </div>
            </div>
            <div className="mt-4 border-t border-cocoa-200 pt-4 text-sm text-cocoa-600">
              Planning a corporate tasting or requiring custom bulk gifting?{" "}
              <Link href="/corporate-gifting" className="font-semibold text-cocoa-900 underline">
                View Gifting Guidelines
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cocoa-50">
            <Image src={MAP_IMAGE} alt="Atelier location" fill className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
