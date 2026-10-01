import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { apiServer, ApiRequestError } from "@/lib/api/server";
import type { Me } from "@/lib/api/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let me: Me | null = null;
  try {
    me = await apiServer.get<Me>("/me");
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) {
      redirect("/login?callbackUrl=/admin");
    }
    throw err;
  }

  if (me.role !== "ADMIN" && me.role !== "STAFF") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-cream-100">
      <AdminSidebar userName={me.name ?? me.email} userRole={me.role} />
      <div className="flex-1 overflow-y-auto">
        <AdminTopbar />
        <main className="p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
