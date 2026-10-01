"use server";

import { prisma } from "@/lib/prisma";

export async function listCustomers() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { total: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  return customers.map((c) => ({
    id: c.id,
    name: c.name ?? "—",
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    orderCount: c.orders.length,
    totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
    lastOrderAt: c.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt,
  }));
}

export async function getCustomerById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { include: { items: true }, orderBy: { createdAt: "desc" } },
    },
  });
}
