"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatINR } from "@/lib/format";

const NAV_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "Our Story" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-wider text-cocoa-700 hover:text-cocoa-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button className="md:hidden text-cocoa-700" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="font-serif text-2xl font-bold tracking-[0.15em] text-cocoa-900">
          ZEST
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/search" aria-label="Search" className="hidden items-center gap-1.5 text-xs font-medium text-cocoa-600 hover:text-cocoa-900 sm:flex">
            <Search size={16} />
            <span className="hidden lg:inline">Search</span>
          </Link>
          <Link href="/account" aria-label="Account" className="hidden items-center gap-1.5 text-xs font-medium text-cocoa-600 hover:text-cocoa-900 sm:flex">
            <User size={16} />
            <span className="hidden lg:inline">Account</span>
          </Link>
          <Link href="/cart" aria-label="Cart" className="flex items-center gap-1.5 text-xs font-medium text-cocoa-900">
            <span className="relative">
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-cocoa-900 text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </span>
            <span className="hidden lg:inline">
              Cart {itemCount > 0 ? `(${formatINR(subtotal)})` : "(0)"}
            </span>
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden flex flex-col gap-1 border-t border-cocoa-100 bg-white px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-cocoa-700 hover:bg-cocoa-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
