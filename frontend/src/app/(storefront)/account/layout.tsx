import Link from "next/link";
import { AccountSidebar } from "@/components/storefront/AccountSidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-xs text-cocoa-400">
        <Link href="/" className="hover:text-cocoa-700">Home</Link>
        <span>/</span>
        <span className="text-cocoa-700">My Account</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[200px_1fr]">
        <AccountSidebar />
        <div>{children}</div>
      </div>
    </div>
  );
}
