"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { updateStoreSettings } from "@/lib/actions/settings";
import type { StoreSettings } from "@prisma/client";

const CURRENCIES = ["USD", "INR", "EUR", "GBP"];

export function GeneralSettingsForm({ settings }: { settings: StoreSettings }) {
  const [form, setForm] = useState({
    storeName: settings.storeName,
    domain: settings.domain ?? "",
    timezone: settings.timezone,
    currency: settings.currency,
    contactEmail: settings.contactEmail ?? "",
    instagramHandle: settings.instagramHandle ?? "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    await updateStoreSettings(form);
    setStatus("done");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-cocoa-100 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Store Name" value={form.storeName} onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))} />
        <Input label="Store Custom Domain URL" value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} />
        <Select label="Store Timezone" value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}>
          {["Europe/Paris", "America/New_York", "Asia/Kolkata", "UTC"].map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </Select>
        <Select label="Default Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
        <Input label="Contact Email Address" type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} />
        <Input label="Instagram Handle" value={form.instagramHandle} onChange={(e) => setForm((f) => ({ ...f, instagramHandle: e.target.value }))} />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save Changes"}
        </Button>
        {status === "done" && <span className="text-xs text-success-600">Saved.</span>}
      </div>
    </form>
  );
}
