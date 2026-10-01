"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { apiServer } from "@/lib/api/server";

const leadSchema = z.object({
  type: z.enum(["CONTACT", "CORPORATE_GIFTING"]),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
});

export async function submitLead(input: z.infer<typeof leadSchema>) {
  const data = leadSchema.parse(input);
  await apiServer.post("/leads", data);
}

export async function subscribeToNewsletter(email: string) {
  const parsed = z.string().email().parse(email);
  await apiServer.post("/newsletter", { email: parsed });
}

export type Lead = {
  id: string;
  type: "CONTACT" | "CORPORATE_GIFTING" | "NEWSLETTER";
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isHandled: boolean;
  createdAt: string;
};

export async function listLeads() {
  return apiServer.get<Lead[]>("/admin/leads");
}

export async function markLeadHandled(id: string, isHandled: boolean) {
  await apiServer.patch(`/admin/leads/${id}/handled?is_handled=${isHandled}`);
  revalidatePath("/admin/leads");
}
