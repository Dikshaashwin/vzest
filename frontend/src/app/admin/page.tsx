import { IndianRupee, ShoppingCart, Clock, AlertTriangle, XCircle, Users } from "lucide-react";
import { getDashboardData } from "@/lib/actions/dashboard";
import { safe } from "@/lib/safe";
import { StatCard } from "@/components/admin/StatCard";
import { formatDate, formatINR } from "@/lib/format";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard" };

const EMPTY_DATA = {
  stats: {
    todayRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalCustomers: 0,
  },
  recentOrders: [],
  topProducts: [],
};

export default async function AdminDashboardPage() {
  const { stats, recentOrders, topProducts } = await safe(() => getDashboardData(), EMPTY_DATA);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Today's Revenue" value={formatINR(stats.todayRevenue)} icon={IndianRupee} />
        <StatCard label="Today's Orders" value={stats.todayOrders} icon={ShoppingCart} />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={Clock} tone="warning" />
        <StatCard label="Low Stock" value={stats.lowStockCount} icon={AlertTriangle} tone="warning" />
        <StatCard label="Out of Stock" value={stats.outOfStockCount} icon={XCircle} tone="danger" />
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={Users} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-cocoa-100 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-cocoa-800">Recent Orders</p>
            <Link href="/admin/orders" className="text-xs font-medium text-gold-600 hover:underline">
              View all
            </Link>
          </div>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cocoa-400">
                <th className="pb-2">Order</th>
                <th className="pb-2">Items</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa-50">
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-cocoa-400">
                    No orders yet.
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2 font-medium text-cocoa-800">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-2 text-cocoa-500">{order.items.length}</td>
                  <td className="py-2 text-cocoa-700">{formatINR(order.total)}</td>
                  <td className="py-2 text-cocoa-500">{order.status.replaceAll("_", " ")}</td>
                  <td className="py-2 text-cocoa-400">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
          <p className="text-sm font-semibold text-cocoa-800">Top Selling Products</p>
          <ul className="mt-4 space-y-3">
            {topProducts.length === 0 && <li className="text-sm text-cocoa-400">No sales yet.</li>}
            {topProducts.map((p) => (
              <li key={p.productId} className="flex justify-between text-sm">
                <span className="text-cocoa-700">{p.name}</span>
                <span className="font-medium text-cocoa-900">{p.unitsSold} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
