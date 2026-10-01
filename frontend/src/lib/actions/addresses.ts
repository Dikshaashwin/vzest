"use server";

import { revalidatePath } from "next/cache";
import { addressSchema } from "@/lib/validators";
import { apiServer, ApiRequestError } from "@/lib/api/server";
import type { Address } from "@/lib/api/types";
import { z } from "zod";

function requireSignedIn(err: unknown): never {
  if (err instanceof ApiRequestError && err.status === 401) {
    throw new Error("You must be signed in to do that.");
  }
  throw err;
}

export async function getMyAddresses() {
  try {
    return await apiServer.get<Address[]>("/account/addresses");
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return [];
    throw err;
  }
}

export async function createAddress(input: z.infer<typeof addressSchema> & { isDefault?: boolean }) {
  const data = addressSchema.parse(input);
  try {
    const address = await apiServer.post<Address>(
      `/account/addresses?is_default=${input.isDefault ?? false}`,
      data,
    );
    revalidatePath("/account/addresses");
    return address;
  } catch (err) {
    return requireSignedIn(err);
  }
}

export async function deleteAddress(id: string) {
  try {
    await apiServer.delete(`/account/addresses/${id}`);
  } catch (err) {
    return requireSignedIn(err);
  }
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: string) {
  try {
    await apiServer.patch(`/account/addresses/${id}/default`);
  } catch (err) {
    return requireSignedIn(err);
  }
  revalidatePath("/account/addresses");
}
