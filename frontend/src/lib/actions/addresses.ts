"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { addressSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getMyAddresses() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { isDefault: "desc" } });
}

export async function createAddress(input: z.infer<typeof addressSchema> & { isDefault?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be signed in to save an address.");

  const data = addressSchema.parse(input);

  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { ...data, userId: session.user.id, isDefault: input.isDefault ?? false },
  });

  revalidatePath("/account/addresses");
  return address;
}

export async function deleteAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be signed in.");
  await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be signed in.");
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}
