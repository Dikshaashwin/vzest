import Link from "next/link";
import { getAccountSummary } from "@/lib/actions/account";
import { formatDate, formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ORDER_STATUS_TONE } from "@/lib/status-tone";

export const metadata = { title: "Order History" };

export default async function OrderHistoryPage() {
  const account = await getAccountSummary();
  if (!account) return null;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Order History</h1>

      {account.orders.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-cocoa-200 py-12 text-center text-sm text-cocoa-400">
          No orders yet — <Link href="/shop" className="underline">start shopping</Link>.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cocoa-100 text-left text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa-50">
              {account.orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-cocoa-900">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-cocoa-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={ORDER_STATUS_TONE[order.status]}>{order.status.replaceAll("_", " ")}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-cocoa-500">{order.items.length} item{order.items.length === 1 ? "" : "s"}</td>
                  <td className="px-4 py-3 font-semibold text-cocoa-800">{formatINR(order.total)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/account/orders/${order.id}`} className="text-xs font-semibold uppercase tracking-wider text-cocoa-600 underline">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
