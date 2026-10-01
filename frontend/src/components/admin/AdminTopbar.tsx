"use client";

import { Search, Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminTopbar() {
  const router = useRouter();

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-4 border-b border-cocoa-100 bg-white px-6 py-3">
      <div className="flex w-72 items-center gap-2 rounded-lg border border-cocoa-200 bg-cream-50 px-3 py-2">
        <Search size={15} className="text-cocoa-400" />
        <input placeholder="Search everything..." className="w-full bg-transparent text-sm focus:outline-none" />
      </div>
      <button aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-full border border-cocoa-200 text-cocoa-600 hover:bg-cocoa-50">
        <Bell size={16} />
      </button>
      <button
        onClick={handleSignOut}
        aria-label="Sign out"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-cocoa-200 text-cocoa-600 hover:bg-cocoa-50"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
