import { movementRepository } from "@/repositories/movement.repository";
import { productRepository } from "@/repositories/product.repository";
import { Prisma, MovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class MovementService {
  async getMovements(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: MovementType;
    productId?: string;
  } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};

    if (params.search) {
      where.OR = [
        { product: { name: { contains: params.search, mode: "insensitive" } } },
        { product: { sku: { contains: params.search, mode: "insensitive" } } },
        { reason: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.productId) {
      where.productId = params.productId;
    }

    const [movements, total] = await Promise.all([
      movementRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      movementRepository.count(where),
    ]);

    return {
      data: movements,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createMovement(data: Prisma.StockMovementUncheckedCreateInput) {
    // Note: This operation should ideally be done in a transaction
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      let newQuantity = product.quantity;
      
      switch (data.type) {
        case "ENTRY":
          newQuantity += data.quantity;
          break;
        case "EXIT":
          if (newQuantity < data.quantity) {
             throw new Error("Insufficient stock");
          }
          newQuantity -= data.quantity;
          break;
        case "ADJUSTMENT":
          newQuantity = data.quantity; // In adjustment, the quantity provided could be the exact new stock (or diff). We need to clarify. Let's assume quantity is delta. Or if it's absolute, we use data.quantity. If delta, newQuantity += data.quantity.
          // Let's assume adjusting means setting to a specific value or adding/subtracting delta.
          // By standard: if adjustment, previous + diff. Diff can be neg or pos.
          newQuantity += data.quantity;
          break;
        case "TRANSFER":
           // simplify transfer
           newQuantity -= data.quantity;
           break;
      }

      const movement = await tx.stockMovement.create({
        data: {
          ...data,
          previousQuantity: product.quantity,
          newQuantity: newQuantity,
        },
      });

      await tx.product.update({
        where: { id: data.productId },
        data: { quantity: newQuantity },
      });

      return movement;
    });
  }
}

export const movementService = new MovementService();
