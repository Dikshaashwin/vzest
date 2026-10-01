"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/actions/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ProfileForm({ defaultName, email }: { defaultName: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    try {
      await updateProfile({ name, phone: phone || undefined });
      setStatus("done");
      router.refresh();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Email Address" value={email} disabled hint="Contact support to change your email." />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
      {status === "done" && <p className="text-xs text-success-600">Saved.</p>}
      {status === "error" && <p className="text-xs text-danger-600">Something went wrong.</p>}
      <Button type="submit" size="sm" disabled={status === "saving"}>
        Save Changes
      </Button>
    </form>
  );
}
