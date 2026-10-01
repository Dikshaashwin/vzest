"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const DEFAULT_SECTIONS = [
  { key: "hero_banner", title: "Hero Banner", subtitle: 'Displays signature tagline "Pure provenance. Hand-tempered chocolate."', position: 0 },
  { key: "featured_collections", title: "Featured Collections", subtitle: "A 3-column series introducing the Single Origin, Infusion, and Atelier Truffle boxes.", position: 1 },
  { key: "brand_story", title: "Brand Story", subtitle: "Splits a narrative description of slow cast iron roasting beside a landscape photo.", position: 2 },
  { key: "newsletter_callout", title: "Newsletter Callout", subtitle: "Batch release subscription form with dynamic newsletter input fields.", position: 3 },
];

export async function listHomepageSections() {
  const existing = await prisma.homepageSection.findMany({ orderBy: { position: "asc" } });
  if (existing.length > 0) return existing;

  await prisma.homepageSection.createMany({
    data: DEFAULT_SECTIONS.map((s) => ({ ...s, isActive: true })),
  });
  return prisma.homepageSection.findMany({ orderBy: { position: "asc" } });
}

export async function toggleSectionVisibility(id: string, isActive: boolean) {
  await prisma.homepageSection.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

const sectionUpdateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  linkUrl: z.string().optional(),
});

export async function updateSectionContent(id: string, input: z.infer<typeof sectionUpdateSchema>) {
  const data = sectionUpdateSchema.parse(input);
  await prisma.homepageSection.update({ where: { id }, data: { ...data, imageUrl: data.imageUrl || undefined } });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function moveSectionPosition(id: string, direction: "up" | "down") {
  const sections = await prisma.homepageSection.findMany({ orderBy: { position: "asc" } });
  const index = sections.findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= sections.length) return;

  const current = sections[index];
  const swap = sections[swapIndex];

  await prisma.$transaction([
    prisma.homepageSection.update({ where: { id: current.id }, data: { position: swap.position } }),
    prisma.homepageSection.update({ where: { id: swap.id }, data: { position: current.position } }),
  ]);
  revalidatePath("/admin/homepage");
}
