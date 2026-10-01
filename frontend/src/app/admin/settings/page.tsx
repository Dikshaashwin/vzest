import { getStoreSettings } from "@/lib/actions/settings";
import { safe } from "@/lib/safe";
import { GeneralSettingsForm } from "@/components/admin/GeneralSettingsForm";

export const metadata = { title: "Settings" };

const TABS = ["General Settings", "Shipping & Delivery", "Payment Gateway", "Notifications", "SEO Meta Tags"];

export default async function AdminSettingsPage() {
  const settings = await safe(() => getStoreSettings(), {
    id: "singleton",
    storeName: "Zest Chocolates Ltd.",
    domain: null,
    timezone: "Europe/Paris",
    currency: "USD",
    contactEmail: null,
    instagramHandle: null,
    updatedAt: new Date(),
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Atelier Settings</h1>

      <div className="mt-4 flex gap-6 border-b border-cocoa-100 text-sm">
        {TABS.map((tab, i) => (
          <span
            key={tab}
            className={
              i === 0
                ? "border-b-2 border-cocoa-900 pb-3 font-semibold text-cocoa-900"
                : "pb-3 text-cocoa-400"
            }
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="mt-6 max-w-2xl">
        <GeneralSettingsForm settings={settings} />
        <p className="mt-4 text-xs text-cocoa-400">
          Shipping, payment gateway, notification, and SEO settings are managed via environment
          variables for now (see .env.example) — a dedicated UI for these can be added next.
        </p>
      </div>
    </div>
  );
}
