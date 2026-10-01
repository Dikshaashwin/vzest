"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-cocoa-100 bg-cream-50 p-8 text-center">
        <h1 className="font-serif text-2xl font-bold text-cocoa-900">Welcome Back</h1>
        <p className="mt-2 text-sm text-cocoa-500">
          Sign in to your Zest account to manage orders and access your Atelier membership.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-600">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[11px] font-semibold uppercase tracking-wider text-cocoa-500 hover:text-cocoa-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-cocoa-200 bg-white px-3.5 py-2.5 text-sm text-cocoa-900 focus:border-cocoa-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <Checkbox label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <Link href="/contact" className="font-medium text-cocoa-600 underline hover:text-cocoa-900">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-sm text-danger-600">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-cocoa-500">
          New to Zest?{" "}
          <Link href="/register" className="font-semibold text-cocoa-900 underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
