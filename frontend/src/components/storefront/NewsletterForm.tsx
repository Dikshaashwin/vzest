"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/actions/leads";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await subscribeToNewsletter(email);
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("idle");
    }
  };

  if (status === "done") {
    return <p className={clsx("text-sm font-medium text-cocoa-700", className)}>You&apos;re on the list — welcome to the atelier.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={clsx("flex overflow-hidden rounded border border-cocoa-300 bg-white", className)}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="w-full min-w-0 px-4 py-3 text-sm focus:outline-none"
      />
      <Button type="submit" disabled={status === "sending"} className="rounded-none border-none">
        {status === "sending" ? "..." : "Subscribe"}
      </Button>
    </form>
  );
}
