import clsx from "clsx";

const STEPS = ["Shipping", "Payment", "Review"];

export function CheckoutStepper({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const active = stepNum <= current;
        return (
          <div key={step} className="flex items-center gap-3">
            <span className={clsx("font-medium", active ? "text-cocoa-900" : "text-cocoa-300")}>
              {stepNum}. {step}
            </span>
            {i < STEPS.length - 1 && <span className="h-px w-8 bg-cocoa-200" />}
          </div>
        );
      })}
    </div>
  );
}
