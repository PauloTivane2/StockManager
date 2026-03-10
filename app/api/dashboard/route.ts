import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Totals and aggregates
    const totalProducts = await prisma.product.count({ where: { deletedAt: null } });
    
    const productsData = await prisma.product.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
      select: { quantity: true, price: true, costPrice: true, minStock: true }
    });

    const totalInventoryValue = productsData.reduce((acc, curr) => acc + (curr.quantity * Number(curr.costPrice)), 0);
    const lowStockAlerts = productsData.filter(p => p.quantity <= p.minStock).length;
    
    // Total Orders (for example)
    const pendingOrdersCount = await prisma.order.count({ where: { status: "PENDING" } });

    return NextResponse.json({
      totalProducts,
      totalInventoryValue,
      lowStockAlerts,
      pendingOrdersCount
    });
  } catch (error) {
    console.error("GET Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao obter os dados do dashboard." }, { status: 500 });
  }
}
