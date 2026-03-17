import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supplierSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    // Se isSelect for true, retorna todos (limite alto) e com poucas prop para selects options
    const isSelect = searchParams.get("isSelect") === "true";

    const where = {
      name: { contains: search, mode: "insensitive" as const },
      deletedAt: null,
    };

    if (isSelect) {
      const suppliers = await prisma.supplier.findMany({
        where,
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      });
      return NextResponse.json(suppliers);
    }

    const skip = (page - 1) * limit;

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    return NextResponse.json({
      data: suppliers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET Suppliers Error:", error);
    return NextResponse.json({ error: "Erro ao listar fornecedores." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = supplierSchema.parse(body);

    const supplier = await prisma.supplier.create({
      data: {
        ...validatedData,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    console.error("POST Supplier Error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos.", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Ocorreu um erro ao criar o fornecedor." }, { status: 500 });
  }
}
