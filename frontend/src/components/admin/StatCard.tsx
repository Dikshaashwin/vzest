import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-cocoa-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-cocoa-500">{label}</p>
        <Icon
          size={18}
          className={clsx(
            tone === "warning" && "text-gold-600",
            tone === "danger" && "text-red-600",
            tone === "default" && "text-cocoa-400"
          )}
        />
      </div>
      <p className="mt-2 text-2xl font-semibold text-cocoa-900">{value}</p>
    </div>
  );
}
