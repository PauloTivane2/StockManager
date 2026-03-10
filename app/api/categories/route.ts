import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = {
      name: { contains: search, mode: "insensitive" as const },
      deletedAt: null,
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true } } }
      }),
      prisma.category.count({ where }),
    ]);

    return NextResponse.json({
      data: categories,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET Categories Error:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao listar as categorias." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Verificar se a categoria ou slug já existe
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name: validatedData.name }, { slug }] }
    });

    if (existing) {
      return NextResponse.json({ error: "Uma categoria com este nome já existe." }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        slug,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("POST Category Error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos.", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Ocorreu um erro ao criar a categoria." }, { status: 500 });
  }
}
