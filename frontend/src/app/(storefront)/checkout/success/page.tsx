import { CheckCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { trackOrder } from "@/lib/actions/orders";
import { safe } from "@/lib/safe";
import { formatINR } from "@/lib/format";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const { order: orderNumber, email } = await searchParams;
  const order = orderNumber && email ? await safe(() => trackOrder(orderNumber, email), null) : null;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cocoa-300">
        <CheckCircle className="text-cocoa-800" size={26} strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-cocoa-400">Order Confirmed</p>
      <h1 className="mt-2 font-serif text-2xl font-bold text-cocoa-900">Your chocolate is on its way.</h1>
      <p className="mt-2 text-sm text-cocoa-500">
        Thank you for supporting artisan cacao.
        {order && (
          <>
            {" "}
            We&apos;ve sent a confirmation email to <strong>{order.customerEmail}</strong> with
            details of your micro-batch selection.
          </>
        )}
      </p>

      {order && (
        <div className="mt-8 rounded-2xl border border-cocoa-100 p-6 text-left text-sm">
          <div className="flex justify-between text-cocoa-600">
            <span>Order Number</span>
            <span className="font-semibold text-cocoa-900">#{order.orderNumber}</span>
          </div>
          <div className="mt-2 flex justify-between text-cocoa-600">
            <span>Shipping Service</span>
            <span className="font-semibold text-cocoa-900">Standard Fresh (Insulated Cold-Pack)</span>
          </div>
          <ul className="mt-4 space-y-1 border-t border-cocoa-100 pt-4 text-cocoa-600">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.name} ({item.variantLabel}) × {item.quantity}
                </span>
                <span>{formatINR(Number(item.price) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-cocoa-100 pt-4 font-semibold text-cocoa-900">
            <span>Amount Charged</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <LinkButton href="/track-order">Track Your Order</LinkButton>
        <LinkButton href="/" variant="tertiary">
          Back to Home Page
        </LinkButton>
      </div>
    </div>
  );
}
