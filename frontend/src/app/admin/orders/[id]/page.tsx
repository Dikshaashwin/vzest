import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/orders";
import { formatDate, formatINR } from "@/lib/format";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";

export const metadata = { title: "Order Detail" };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-cocoa-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-cocoa-400">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
            <p className="text-sm font-semibold text-cocoa-800">Items</p>
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
              <Row label="Subtotal" value={formatINR(order.subtotal)} />
              <Row label="Discount" value={`- ${formatINR(order.discount)}`} />
              <Row label="Shipping" value={formatINR(order.shippingFee)} />
              <Row label="GST" value={formatINR(order.gstAmount)} />
              <Row label="Total" value={formatINR(order.total)} bold />
            </div>
          </div>

          {order.shipment && (
            <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
              <p className="text-sm font-semibold text-cocoa-800">Shipment</p>
              <div className="mt-3 space-y-1 text-sm text-cocoa-600">
                <p>Courier: {order.shipment.courierName ?? "—"}</p>
                <p>AWB: {order.shipment.awbCode ?? "—"}</p>
                <p>Status: {order.shipment.status}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
            <p className="text-sm font-semibold text-cocoa-800">Customer</p>
            <div className="mt-3 space-y-1 text-sm text-cocoa-600">
              <p>{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>
          </div>

          {order.address && (
            <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
              <p className="text-sm font-semibold text-cocoa-800">Shipping Address</p>
              <div className="mt-3 space-y-1 text-sm text-cocoa-600">
                <p>{order.address.fullName}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.state} {order.address.pincode}
                </p>
                <p>{order.address.phone}</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
            <p className="text-sm font-semibold text-cocoa-800">Payment</p>
            <div className="mt-3 space-y-1 text-sm text-cocoa-600">
              <p>Provider: {order.payment?.provider ?? "—"}</p>
              <p>Status: {order.payment?.status ?? "—"}</p>
              {order.payment?.razorpayPaymentId && <p>Payment ID: {order.payment.razorpayPaymentId}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-cocoa-900" : "text-cocoa-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
