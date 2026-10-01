import { X, HelpCircle } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

const STEPS = [
  "Verify card number, expiration date, and CVV are entered exactly as shown on the card.",
  "Check billing address matches the details registered with your bank.",
  "Try alternative checkout gateways like PayPal or Apple Pay.",
];

export default async function CheckoutFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-danger-600">
        <X className="text-danger-600" size={26} strokeWidth={1.5} />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-danger-600">Transaction Declined</p>
      <h1 className="mt-2 font-serif text-2xl font-bold text-cocoa-900">Payment was unsuccessful</h1>
      <p className="mt-2 text-sm text-cocoa-500">
        Your order was not completed because the card issuer declined the charge. No funds have
        been deducted from your account.
      </p>

      <div className="mt-8 rounded-2xl border border-cocoa-100 bg-cream-100 p-6 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-700">Suggested Troubleshooting Steps</p>
        <ul className="mt-3 space-y-2">
          {STEPS.map((step) => (
            <li key={step} className="flex items-start gap-2 text-sm text-cocoa-600">
              <HelpCircle size={16} className="mt-0.5 flex-shrink-0 text-cocoa-400" />
              {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <LinkButton href="/checkout">Retry Payment Method</LinkButton>
        <LinkButton href="/contact" variant="secondary">
          Contact Concierge
        </LinkButton>
      </div>
      <LinkButton href="/cart" variant="tertiary" className="mt-4">
        Return to Cart & Edit Selection {order && `(${order})`}
      </LinkButton>
    </div>
  );
}
