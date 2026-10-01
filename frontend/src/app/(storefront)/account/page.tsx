import Link from "next/link";
import { getAccountSummary } from "@/lib/actions/account";
import { formatDate, formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ORDER_STATUS_TONE } from "@/lib/status-tone";

export const metadata = { title: "My Account" };

export default async function AccountOverviewPage() {
  const account = await getAccountSummary();
  if (!account) return null;

  const defaultAddress = account.addresses[0];
  const lastOrder = account.orders[0];

  return (
    <div>
      <div className="rounded-2xl bg-cream-100 p-6">
        <h1 className="font-serif text-2xl font-bold text-cocoa-900">Bonjour, {account.name ?? "there"}</h1>
        <p className="mt-1 text-sm text-cocoa-500">
          Atelier member since {formatDate(account.createdAt)}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-cocoa-100 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Recent Orders</p>
          <p className="mt-1 text-2xl font-semibold text-cocoa-900">{account.orders.length} Total</p>
          {lastOrder && <p className="mt-1 text-xs text-cocoa-400">Last ordered: {lastOrder.items[0]?.name}</p>}
        </div>
        <div className="rounded-2xl border border-cocoa-100 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Default Address</p>
          {defaultAddress ? (
            <>
              <p className="mt-1 text-sm font-semibold text-cocoa-900">{defaultAddress.city}, {defaultAddress.state}</p>
              <p className="text-xs text-cocoa-400">{defaultAddress.pincode}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-cocoa-400">No address saved</p>
          )}
        </div>
        <div className="rounded-2xl border border-cocoa-100 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">My Wishlist</p>
          <p className="mt-1 text-2xl font-semibold text-cocoa-900">{account.wishlist.length} Items</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-cocoa-900">Recent Activity</h2>
          <Link href="/account/orders" className="text-xs font-semibold uppercase tracking-wider text-cocoa-600 underline">
            View all orders
          </Link>
        </div>

        {account.orders.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-cocoa-200 py-10 text-center text-sm text-cocoa-400">
            No orders yet — <Link href="/shop" className="underline">start shopping</Link>.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-cocoa-100 rounded-2xl border border-cocoa-100">
            {account.orders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-semibold text-cocoa-900">Order #{order.orderNumber}</p>
                  <p className="text-xs text-cocoa-400">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge tone={ORDER_STATUS_TONE[order.status]}>{order.status.replaceAll("_", " ")}</StatusBadge>
                <p className="text-sm font-semibold text-cocoa-800">{formatINR(order.total)}</p>
                <Link href={`/account/orders/${order.id}`} className="text-xs font-semibold uppercase tracking-wider text-cocoa-600 underline">
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
