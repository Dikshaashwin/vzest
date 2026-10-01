"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const leadSchema = z.object({
  type: z.enum(["CONTACT", "CORPORATE_GIFTING"]),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
});

export async function submitLead(input: z.infer<typeof leadSchema>) {
  const data = leadSchema.parse(input);
  await prisma.lead.create({ data });
}

export async function subscribeToNewsletter(email: string) {
  const parsed = z.string().email().parse(email);
  await prisma.lead.upsert({
    where: { email_type: { email: parsed, type: "NEWSLETTER" } },
    update: {},
    create: { type: "NEWSLETTER", email: parsed },
  });
}

export async function listLeads() {
  return prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
}

export async function markLeadHandled(id: string, isHandled: boolean) {
  await prisma.lead.update({ where: { id }, data: { isHandled } });
  revalidatePath("/admin/leads");
}
