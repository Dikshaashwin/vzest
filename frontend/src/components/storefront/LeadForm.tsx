"use client";

import { useState } from "react";
import { submitLead } from "@/lib/actions/leads";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

const SUBJECTS = ["Custom / Order Inquiry", "Corporate Gifting", "Wholesale", "Press", "Other"];

export function LeadForm({
  type,
  messagePlaceholder,
  showSubject,
}: {
  type: "CONTACT" | "CORPORATE_GIFTING";
  messagePlaceholder: string;
  showSubject?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("submitting");
    try {
      const subject = form.get("subject");
      const rawMessage = String(form.get("message"));
      await submitLead({
        type,
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone") || ""),
        message: subject ? `[${subject}] ${rawMessage}` : rawMessage,
      });
      setStatus("done");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p className="rounded-xl bg-cocoa-50 p-4 text-sm text-cocoa-700">
        Thanks — we&apos;ve received your message and will get back to you shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Your Name" name="name" required placeholder="e.g. Eleanor Vance" />
      <Input label="Email Address" name="email" type="email" required placeholder="e.g. eleanor@atelier.com" />
      {showSubject && (
        <Select label="Subject / Inquiry Type" name="subject" defaultValue={SUBJECTS[0]}>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      )}
      <Input label="Phone (optional)" name="phone" placeholder="Optional" />
      <Textarea label="Your Message" name="message" required rows={4} placeholder={messagePlaceholder} />
      {status === "error" && <p className="text-sm text-danger-600">Something went wrong. Please try again.</p>}
      <Button type="submit" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? "Sending..." : type === "CONTACT" ? "Submit Inquiry" : "Send Message"}
      </Button>
    </form>
  );
}
