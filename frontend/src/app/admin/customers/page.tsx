import Link from "next/link";
import { listCustomers } from "@/lib/actions/customers";
import { safe } from "@/lib/safe";
import { formatDate, formatINR } from "@/lib/format";

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await safe(() => listCustomers(), []);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Customers</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs text-cocoa-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spent</th>
              <th className="px-4 py-3">Last Order</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50">
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-cocoa-400">
                  No customers yet.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-cocoa-800">
                  <Link href={`/admin/customers/${c.id}`} className="hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-cocoa-600">{c.email}</td>
                <td className="px-4 py-3 text-cocoa-500">{c.orderCount}</td>
                <td className="px-4 py-3 text-cocoa-700">{formatINR(c.totalSpent)}</td>
                <td className="px-4 py-3 text-cocoa-400">
                  {c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}
                </td>
                <td className="px-4 py-3 text-cocoa-400">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
