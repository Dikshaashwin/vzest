"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { apiServer, ApiRequestError } from "@/lib/api/server";
import type { Address, Me, Order, WishlistItem } from "@/lib/api/types";

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerCustomer(input: z.infer<typeof registerSchema>) {
  const data = registerSchema.parse(input);
  const supabase = await createClient();

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { name: `${data.firstName} ${data.lastName}`.trim() } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      throw new Error("An account with this email already exists.");
    }
    throw new Error(error.message);
  }

  return { emailConfirmationRequired: !signUpData.session };
}

export type AccountSummary = Me & {
  orders: Order[];
  addresses: Address[];
  wishlist: WishlistItem[];
};

export async function getAccountSummary(): Promise<AccountSummary | null> {
  try {
    const [me, orders, addresses, wishlist] = await Promise.all([
      apiServer.get<Me>("/me"),
      apiServer.get<Order[]>("/account/orders"),
      apiServer.get<Address[]>("/account/addresses"),
      apiServer.get<WishlistItem[]>("/account/wishlist"),
    ]);
    return { ...me, orders, addresses, wishlist };
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return null;
    throw err;
  }
}

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
});

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const data = profileSchema.parse(input);
  await apiServer.patch("/me", data);
  revalidatePath("/account/settings");
}

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function changePassword(input: { newPassword: string }) {
  const data = passwordSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: data.newPassword });
  if (error) throw new Error(error.message);
}
