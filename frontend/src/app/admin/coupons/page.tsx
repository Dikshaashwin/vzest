import { Plus } from "lucide-react";
import { listCoupons } from "@/lib/actions/coupons";
import { safe } from "@/lib/safe";
import { formatDate } from "@/lib/format";
import { LinkButton } from "@/components/ui/Button";
import { CouponRowActions } from "@/components/admin/CouponRowActions";
import { StatusBadge, type BadgeTone } from "@/components/ui/StatusBadge";

export const metadata = { title: "Coupons" };

function couponStatus(coupon: { isActive: boolean; startsAt: Date | null; endsAt: Date | null }): { label: string; tone: BadgeTone } {
  const now = new Date();
  if (!coupon.isActive) return { label: "Inactive", tone: "neutral" };
  if (coupon.endsAt && now > coupon.endsAt) return { label: "Expired", tone: "danger" };
  if (coupon.startsAt && now < coupon.startsAt) return { label: "Scheduled", tone: "warning" };
  return { label: "Active", tone: "success" };
}

export default async function AdminCouponsPage() {
  const coupons = await safe(() => listCoupons(), []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-cocoa-900">Coupons</h1>
        <LinkButton href="/admin/coupons/new">
          <Plus size={16} /> New Coupon
        </LinkButton>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cocoa-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 text-left text-xs text-cocoa-400">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Valid Till</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cocoa-50">
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-cocoa-400">
                  No coupons yet.
                </td>
              </tr>
            )}
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-4 py-3 font-mono font-medium text-cocoa-800">{coupon.code}</td>
                <td className="px-4 py-3 text-cocoa-600">
                  {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : `₹${coupon.value}`}
                </td>
                <td className="px-4 py-3 text-cocoa-500">
                  {coupon.minOrderValue ? `₹${coupon.minOrderValue}` : "—"}
                </td>
                <td className="px-4 py-3 text-cocoa-500">
                  {coupon._count.usages}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3 text-cocoa-400">
                  {coupon.endsAt ? formatDate(coupon.endsAt) : "No expiry"}
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const status = couponStatus(coupon);
                    return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
                  })()}
                </td>
                <td className="px-4 py-3">
                  <CouponRowActions couponId={coupon.id} isActive={coupon.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
