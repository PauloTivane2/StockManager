import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Filter missing/alert stock: quantity <= minStock
    const where = {
      deletedAt: null,
      status: "ACTIVE",
      quantity: {
        lte: prisma.product.fields.minStock // Require Prisma >= 4.3.0 for comparing fields directly 
        // fallback in old versions requires raw queries, but standard for most newer setups:
      }
    };
    
    // Fallback if field comparison fails is a raw query, or just fetching and filtering
    // Let's use a standard prisma lookup with where that checks if quantity is very low
    // Wait, simple condition `quantity: { lte: 10 }` works but we want strictly below each product's minStock
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null, status: "ACTIVE" }, // We'll filter in JS if raw isn't used
        // or raw: await prisma.$queryRaw`SELECT * FROM Product WHERE quantity <= minStock`
      }),
      prisma.product.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    ]);

    const lowStockProducts = products.filter(p => p.quantity <= p.minStock);

    // Manual basic pagination for simplicity on low stock unless raw query is preferred
    const paginated = lowStockProducts.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginated,
      meta: { total: lowStockProducts.length, page, limit, totalPages: Math.ceil(lowStockProducts.length / limit) },
    });
  } catch (error) {
    console.error("GET Low Stock Error:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao listar items com baixo stock." }, { status: 500 });
  }
}
