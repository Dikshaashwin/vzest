"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Percent,
  FolderKanban,
  LayoutTemplate,
  Settings,
  Inbox,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Percent },
  { href: "/admin/collections", label: "Collections", icon: FolderKanban },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/homepage", label: "Homepage", icon: LayoutTemplate },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-shrink-0 flex-col border-r border-cocoa-100 bg-white">
      <div className="px-5 py-5">
        <Link href="/admin" className="font-serif text-xl font-bold tracking-[0.15em] text-cocoa-900">
          ZEST
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                active ? "bg-cocoa-900 text-white" : "text-cocoa-600 hover:bg-cocoa-50"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-cocoa-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cocoa-100 text-sm font-semibold text-cocoa-700">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-cocoa-900">{userName}</p>
          <p className="text-xs text-cocoa-400">{userRole}</p>
        </div>
      </div>
    </aside>
  );
}
