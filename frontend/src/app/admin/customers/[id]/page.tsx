import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerById } from "@/lib/actions/customers";
import { formatDate, formatINR } from "@/lib/format";

export const metadata = { title: "Customer Detail" };

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">{customer.name ?? customer.email}</h1>
      <p className="text-sm text-cocoa-400">
        {customer.email} · {customer.phone ?? "No phone on file"} · Joined {formatDate(customer.createdAt)}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
          <p className="text-sm text-cocoa-500">Total Orders</p>
          <p className="mt-1 text-xl font-semibold text-cocoa-900">{customer.orders.length}</p>
        </div>
        <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
          <p className="text-sm text-cocoa-500">Total Spent</p>
          <p className="mt-1 text-xl font-semibold text-cocoa-900">{formatINR(totalSpent)}</p>
        </div>
        <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
          <p className="text-sm text-cocoa-500">Saved Addresses</p>
          <p className="mt-1 text-xl font-semibold text-cocoa-900">{customer.addresses.length}</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs text-cocoa-400">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50">
            {customer.orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-cocoa-400">
                  No orders yet.
                </td>
              </tr>
            )}
            {customer.orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium text-cocoa-800">
                  <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-cocoa-500">{order.items.length}</td>
                <td className="px-4 py-3 text-cocoa-700">{formatINR(order.total)}</td>
                <td className="px-4 py-3 text-cocoa-500">{order.status.replaceAll("_", " ")}</td>
                <td className="px-4 py-3 text-cocoa-400">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
