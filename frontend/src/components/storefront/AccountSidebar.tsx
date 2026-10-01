"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const NAV = [
  { href: "/account", label: "Account Overview", exact: true },
  { href: "/account/orders", label: "Order History" },
  { href: "/account/addresses", label: "Saved Addresses" },
  { href: "/account/wishlist", label: "My Wishlist" },
  { href: "/account/settings", label: "Profile Settings" },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Menu</p>
      <nav className="mt-3 space-y-1">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "block rounded px-3 py-2 text-sm font-medium",
                active ? "bg-cocoa-50 text-cocoa-900" : "text-cocoa-600 hover:bg-cocoa-50"
              )}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="block w-full rounded px-3 py-2 text-left text-sm font-medium text-cocoa-600 hover:bg-cocoa-50"
        >
          Log Out
        </button>
      </nav>
    </aside>
  );
}
