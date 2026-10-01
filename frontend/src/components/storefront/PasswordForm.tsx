"use client";

import { useState } from "react";
import { changePassword } from "@/lib/actions/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    try {
      await changePassword({ currentPassword, newPassword });
      setStatus("done");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} hint="At least 8 characters." />
      {error && <p className="text-xs text-danger-600">{error}</p>}
      {status === "done" && <p className="text-xs text-success-600">Password updated.</p>}
      <Button type="submit" size="sm" disabled={status === "saving"}>
        Update Password
      </Button>
    </form>
  );
}
