import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const slug = validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: validatedData.name }, { slug }],
        NOT: { id: params.id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Uma categoria com este nome já existe." }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        slug,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos.", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar categoria." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if category is used
    const inUse = await prisma.product.findFirst({
      where: { categoryId: params.id, deletedAt: null },
    });

    if (inUse) {
      return NextResponse.json(
        { error: "Não é possível deletar esta categoria pois possui produtos vinculados." },
        { status: 400 }
      );
    }

    await prisma.category.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Categoria deletada com sucesso." });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar categoria." }, { status: 500 });
  }
}
