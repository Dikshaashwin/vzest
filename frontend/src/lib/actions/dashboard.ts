"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayOrders, pendingOrders, lowStockVariants, outOfStockCount, totalCustomers, revenueAgg] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { status: { in: ["PAID", "CONFIRMED", "PROCESSING"] } } }),
      prisma.productVariant.findMany({ where: { stock: { gt: 0 } }, select: { stock: true, lowStockAt: true } }),
      prisma.productVariant.count({ where: { stock: 0 } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfDay }, status: { not: "PAYMENT_PENDING" } },
      }),
    ]);

  return {
    todayRevenue: Number(revenueAgg._sum.total ?? 0),
    todayOrders,
    pendingOrders,
    lowStockCount: lowStockVariants.filter((v) => v.stock <= v.lowStockAt).length,
    outOfStockCount,
    totalCustomers,
  };
}

export async function getRecentOrders(take = 8) {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { items: true },
  });
}

export async function getTopProducts(take = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId", "name"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take,
  });
  return grouped.map((g) => ({ productId: g.productId, name: g.name, unitsSold: g._sum.quantity ?? 0 }));
}
