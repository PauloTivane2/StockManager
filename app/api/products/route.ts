import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || undefined;
    const status = searchParams.get("status") as any || undefined;

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      name: { contains: search, mode: "insensitive" as const },
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao listar os produtos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const existingSku = await prisma.product.findUnique({
      where: { sku: validatedData.sku }
    });

    if (existingSku) {
      return NextResponse.json({ error: "Já existe um produto com este SKU." }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        ...validatedData,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("POST Product Error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos.", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Ocorreu um erro ao criar o produto." }, { status: 500 });
  }
}
