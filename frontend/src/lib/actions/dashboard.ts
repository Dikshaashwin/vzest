"use server";

import { apiServer } from "@/lib/api/server";
import type { Order } from "@/lib/api/types";

export type DashboardStats = {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCustomers: number;
};

export type TopProduct = { productId: string; name: string; unitsSold: number };

export type DashboardData = {
  stats: DashboardStats;
  recentOrders: Order[];
  topProducts: TopProduct[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const data = await apiServer.get<{
    stats: Omit<DashboardStats, "todayRevenue"> & { todayRevenue: string };
    recentOrders: Order[];
    topProducts: TopProduct[];
  }>("/admin/dashboard");

  return {
    stats: { ...data.stats, todayRevenue: Number(data.stats.todayRevenue) },
    recentOrders: data.recentOrders,
    topProducts: data.topProducts,
  };
}
