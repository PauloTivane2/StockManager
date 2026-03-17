import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supplierSchema } from "@/lib/validations";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validatedData = supplierSchema.parse(body);

    const supplier = await prisma.supplier.update({
      where: { id: params.id },
      data: {
        ...validatedData,
      },
    });

    return NextResponse.json(supplier);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos.", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar fornecedor." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // We optionally remove the supplier but supplier is not required for product anymore.
    // However, soft delete it:
    await prisma.supplier.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Fornecedor deletado com sucesso." });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar fornecedor." }, { status: 500 });
  }
}
