import { apiServer, ApiRequestError } from "@/lib/api/server";
import type { Me } from "@/lib/api/types";
import { ProfileForm } from "@/components/storefront/ProfileForm";
import { PasswordForm } from "@/components/storefront/PasswordForm";

export const metadata = { title: "Profile Settings" };

export default async function ProfileSettingsPage() {
  let me: Me | null = null;
  try {
    me = await apiServer.get<Me>("/me");
  } catch (err) {
    if (!(err instanceof ApiRequestError && err.status === 401)) throw err;
  }
  if (!me) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-cocoa-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-cocoa-500">Update your personal details and password.</p>
      </div>

      <div className="max-w-md rounded-2xl border border-cocoa-100 p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">Personal Details</p>
        <ProfileForm defaultName={me.name ?? ""} email={me.email} />
      </div>

      <div className="max-w-md rounded-2xl border border-cocoa-100 p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">Change Password</p>
        <PasswordForm />
      </div>
    </div>
  );
}
