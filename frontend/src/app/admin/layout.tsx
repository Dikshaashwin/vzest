import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-cream-100">
      <AdminSidebar userName={session?.user?.name ?? "Admin"} userRole={session?.user?.role ?? "ADMIN"} />
      <div className="flex-1 overflow-y-auto">
        <AdminTopbar />
        <main className="p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
