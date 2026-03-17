import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stockMovementSchema } from "@/lib/validations";
import { MovementType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const productId = searchParams.get("productId") || undefined;
    const type = searchParams.get("type") as MovementType | undefined;

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(productId ? { productId } : {}),
      ...(type ? { type } : {}),
    };

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true } }
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return NextResponse.json({
      data: movements,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET Stock Movements Error:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao listar as movimentações." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = stockMovementSchema.parse(body);

    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId, deletedAt: null }
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    // Calcula nova quantidade
    let newQuantity = product.quantity;
    if (validatedData.type === 'ENTRY' || validatedData.type === 'ADJUSTMENT' && validatedData.quantity > 0) {
      newQuantity += validatedData.quantity;
    } else if (validatedData.type === 'EXIT' || validatedData.type === 'TRANSFER') {
      newQuantity -= validatedData.quantity;
      if (newQuantity < 0) {
        return NextResponse.json({ error: "A quantidade de saída não pode ser maior que o saldo atual." }, { status: 400 });
      }
    }

    // Use session user or fallback to the first user in the DB
    let userId = validatedData.userId;
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
      } else {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          return NextResponse.json({ error: "Nenhum utilizador disponível para registar o movimento." }, { status: 400 });
        }
      }
    }

    // Usar uma transação para garantir que o movimento e o produto sejam atualizados juntos
    const [movement, updatedProduct] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          ...validatedData,
          previousQuantity: product.quantity,
          newQuantity: newQuantity,
          userId: userId
        }
      }),
      prisma.product.update({
        where: { id: product.id },
        data: { quantity: newQuantity }
      })
    ]);

    return NextResponse.json({ movement, product: updatedProduct }, { status: 201 });
  } catch (error: any) {
    console.error("POST Stock Movement Error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Dados inválidos.", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Ocorreu um erro ao registar a movimentação." }, { status: 500 });
  }
}
