"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerCustomer(input: z.infer<typeof registerSchema>) {
  const data = registerSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("An account with this email already exists.");

  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: {
      email: data.email,
      name: `${data.firstName} ${data.lastName}`.trim(),
      passwordHash,
      role: "CUSTOMER",
    },
  });
}

export async function getAccountSummary() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { items: true } },
      addresses: { orderBy: { isDefault: "desc" } },
      wishlist: true,
    },
  });

  return user;
}

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
});

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be signed in.");

  const data = profileSchema.parse(input);
  await prisma.user.update({ where: { id: session.user.id }, data });
  revalidatePath("/account/settings");
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function changePassword(input: z.infer<typeof passwordSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be signed in.");

  const data = passwordSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) throw new Error("No password set for this account.");

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect.");

  const passwordHash = await bcrypt.hash(data.newPassword, 10);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });
}
