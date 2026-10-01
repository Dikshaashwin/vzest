"use server";

import { revalidatePath } from "next/cache";
import { apiServer, ApiRequestError } from "@/lib/api/server";
import type { Order, OrderStatus } from "@/lib/api/types";

export async function trackOrder(orderNumber: string, email: string) {
  try {
    return await apiServer.post<Order>("/orders/track", { orderNumber, email });
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}

export async function getMyOrders() {
  try {
    return await apiServer.get<Order[]>("/account/orders");
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return [];
    throw err;
  }
}

export async function getOrderById(id: string) {
  try {
    return await apiServer.get<Order>(`/account/orders/${id}`);
  } catch (err) {
    if (err instanceof ApiRequestError && (err.status === 404 || err.status === 401)) return null;
    throw err;
  }
}

// ---------- Admin ----------

export async function listOrdersForAdmin(status?: OrderStatus) {
  const qs = status ? `?status=${status}` : "";
  return apiServer.get<Order[]>(`/admin/orders${qs}`);
}

export async function getOrderByIdForAdmin(id: string) {
  try {
    return await apiServer.get<Order>(`/admin/orders/${id}`);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await apiServer.patch<Order>(`/admin/orders/${orderId}/status`, { status });
  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${orderId}`);
  return order;
}
