import Link from "next/link";
import { listOrdersForAdmin } from "@/lib/actions/orders";
import { safe } from "@/lib/safe";
import { formatDate, formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ORDER_STATUS_TONE, PAYMENT_STATUS_TONE } from "@/lib/status-tone";
import type { OrderStatus } from "@prisma/client";

export const metadata = { title: "Orders" };

const STATUS_FILTERS: { key?: OrderStatus; label: string }[] = [
  { label: "All" },
  { key: "PAYMENT_PENDING", label: "Payment Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: OrderStatus }>;
}) {
  const { status } = await searchParams;
  const orders = await safe(() => listOrdersForAdmin(status), []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-cocoa-900">Orders</h1>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <a
            key={f.label}
            href={f.key ? `/admin/orders?status=${f.key}` : "/admin/orders"}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              status === f.key ? "bg-cocoa-800 text-white" : "bg-white text-cocoa-600 hover:bg-cocoa-100"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs text-cocoa-400">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50">
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-cocoa-400">
                  No orders found.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium text-cocoa-800">
                  <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-cocoa-600">{order.customerName}</td>
                <td className="px-4 py-3 text-cocoa-500">{order.items.length}</td>
                <td className="px-4 py-3 text-cocoa-700">{formatINR(order.total)}</td>
                <td className="px-4 py-3">
                  {order.payment ? (
                    <StatusBadge tone={PAYMENT_STATUS_TONE[order.payment.status]}>{order.payment.status}</StatusBadge>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={ORDER_STATUS_TONE[order.status]}>{order.status.replaceAll("_", " ")}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-cocoa-400">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
