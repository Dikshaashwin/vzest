"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { apiServer } from "@/lib/api/server";

export type HomepageSection = {
  id: string;
  key: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  position: number;
  isActive: boolean;
};

export async function listHomepageSections() {
  return apiServer.get<HomepageSection[]>("/admin/homepage-sections");
}

export async function toggleSectionVisibility(id: string, isActive: boolean) {
  await apiServer.patch(`/admin/homepage-sections/${id}/visibility?is_active=${isActive}`);
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
  await apiServer.patch(`/admin/homepage-sections/${id}/content`, { ...data, imageUrl: data.imageUrl || undefined });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function moveSectionPosition(id: string, direction: "up" | "down") {
  await apiServer.patch(`/admin/homepage-sections/${id}/position?direction=${direction}`);
  revalidatePath("/admin/homepage");
}
