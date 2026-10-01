"use server";

import { apiServer, ApiRequestError } from "@/lib/api/server";
import type { Address, Order } from "@/lib/api/types";

export type CustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: string;
  lastOrderAt: string | null;
};

export type CustomerDetail = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  addresses: Address[];
  orders: Order[];
};

export async function listCustomers() {
  return apiServer.get<CustomerListItem[]>("/admin/customers");
}

export async function getCustomerById(id: string) {
  try {
    return await apiServer.get<CustomerDetail>(`/admin/customers/${id}`);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}
