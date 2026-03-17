import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Fetch all active products and filter in-memory (quantity <= minStock)
    const allProducts = await prisma.product.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
      orderBy: { name: "asc" },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    const lowStockProducts = allProducts.filter((p) => p.quantity <= p.minStock);
    const paginated = lowStockProducts.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginated,
      meta: {
        total: lowStockProducts.length,
        page,
        limit,
        totalPages: Math.ceil(lowStockProducts.length / limit),
      },
    });
  } catch (error) {
    console.error("GET Low Stock Error:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao listar items com baixo stock." },
      { status: 500 }
    );
  }
}
