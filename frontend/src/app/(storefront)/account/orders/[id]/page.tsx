import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/orders";
import { formatDate, formatINR } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ORDER_STATUS_TONE } from "@/lib/status-tone";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, order] = await Promise.all([auth(), getOrderById(id)]);

  if (!order || order.userId !== session?.user?.id) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-cocoa-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-cocoa-400">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge tone={ORDER_STATUS_TONE[order.status]}>{order.status.replaceAll("_", " ")}</StatusBadge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-cocoa-100 p-5 lg:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">Items</p>
          <ul className="mt-3 divide-y divide-cocoa-50">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm">
                <span className="text-cocoa-700">
                  {item.name} ({item.variantLabel}) × {item.quantity}
                </span>
                <span className="text-cocoa-600">{formatINR(Number(item.price) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-cocoa-100 pt-4 text-sm">
            <div className="flex justify-between text-cocoa-600"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            <div className="flex justify-between text-cocoa-600"><span>Shipping</span><span>{formatINR(order.shippingFee)}</span></div>
            <div className="flex justify-between text-cocoa-600"><span>Tax</span><span>{formatINR(order.gstAmount)}</span></div>
            <div className="flex justify-between font-semibold text-cocoa-900"><span>Total</span><span>{formatINR(order.total)}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          {order.address && (
            <div className="rounded-2xl border border-cocoa-100 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">Shipping Address</p>
              <div className="mt-2 space-y-0.5 text-sm text-cocoa-600">
                <p>{order.address.fullName}</p>
                <p>{order.address.line1}</p>
                <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
              </div>
            </div>
          )}
          {order.shipment?.awbCode && (
            <div className="rounded-2xl border border-cocoa-100 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">Tracking</p>
              <p className="mt-2 text-sm text-cocoa-600">{order.shipment.courierName} · {order.shipment.awbCode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
