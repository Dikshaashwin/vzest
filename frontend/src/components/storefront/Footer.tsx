"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/actions/leads";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/collections/single-origin", label: "The Origin Series" },
      { href: "/collections/gift-boxes", label: "Gift Collections" },
      { href: "/corporate-gifting", label: "Corporate Gifts" },
      { href: "/about", label: "Our Story" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/faq", label: "FAQs" },
      { href: "/policies/shipping-delivery", label: "Shipping & Returns" },
      { href: "/policies/return-melt", label: "Care & Storage" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M15 3h-2a5 5 0 0 0-5 5v2H6v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await subscribeToNewsletter(email);
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("idle");
    }
  };

  return (
    <footer className="mt-24 border-t border-cocoa-100 bg-cream-100">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-serif text-xl font-bold tracking-[0.15em] text-cocoa-900">ZEST</p>
            <p className="mt-3 text-sm text-cocoa-500">
              Artisanal chocolate defined by pure provenance, masterfully roasted cocoa, and crisp,
              natural zest. Hand-tempered in small batches.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cocoa-100 text-cocoa-700 hover:bg-cocoa-800 hover:text-white"
              >
                <InstagramIcon width={15} height={15} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cocoa-100 text-cocoa-700 hover:bg-cocoa-800 hover:text-white"
              >
                <FacebookIcon width={15} height={15} />
              </a>
              <a
                href="mailto:hello@zestchocolates.com"
                aria-label="Email"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cocoa-100 text-cocoa-700 hover:bg-cocoa-800 hover:text-white"
              >
                <Mail size={15} />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-cocoa-900">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-cocoa-500 hover:text-cocoa-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cocoa-900">Mailing List</p>
            <p className="mt-3 text-sm text-cocoa-500">
              Subscribe for seasonal collections and exclusive batch releases.
            </p>
            {status === "done" ? (
              <p className="mt-3 text-sm text-cocoa-700">You&apos;re on the list.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-3 flex overflow-hidden rounded border border-cocoa-200 bg-white">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email..."
                  className="w-full min-w-0 px-3 py-2 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  aria-label="Subscribe"
                  className="flex items-center justify-center px-3 text-cocoa-800 hover:text-cocoa-900 disabled:opacity-50"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-cocoa-200 pt-6 text-xs text-cocoa-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Zest Chocolates Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-cocoa-700">Instagram</a>
            <a href="#" className="hover:text-cocoa-700">Journal</a>
            <a href="#" className="hover:text-cocoa-700">Pinterest</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
