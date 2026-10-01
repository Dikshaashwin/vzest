"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomer } from "@/lib/actions/account";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const result = await registerCustomer(form);
      if (result.emailConfirmationRequired) {
        setInfo("Account created — check your email to confirm it, then sign in.");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-cocoa-100 bg-cream-50 p-8 text-center">
        <h1 className="font-serif text-2xl font-bold text-cocoa-900">Create an Account</h1>
        <p className="mt-2 text-sm text-cocoa-500">
          Join the Zest Atelier club to receive batch releases, exclusive tastings, and custom
          seasonal curation.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" required value={form.firstName} onChange={update("firstName")} placeholder="Jean" />
            <Input label="Last Name" required value={form.lastName} onChange={update("lastName")} placeholder="Cacao" />
          </div>
          <Input label="Email Address" type="email" required value={form.email} onChange={update("email")} placeholder="name@example.com" />
          <Input label="Password" type="password" required value={form.password} onChange={update("password")} placeholder="Create password" />
          <Input label="Confirm Password" type="password" required value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Repeat password" />

          <div className="space-y-2">
            <Checkbox label="Subscribe to seasonal micro-lot releases & cocoa journals" defaultChecked />
            <Checkbox
              label={
                <>
                  I agree to the <Link href="/policies/terms-of-service" className="underline">Terms of Service</Link> &{" "}
                  <Link href="/policies/privacy-policy" className="underline">Privacy Policy</Link>
                </>
              }
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
          </div>

          {error && <p className="text-sm text-danger-600">{error}</p>}
          {info && <p className="text-sm text-success-600">{info}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-cocoa-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-cocoa-900 underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
