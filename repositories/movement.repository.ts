import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class MovementRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.StockMovementWhereInput;
    orderBy?: Prisma.StockMovementOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.stockMovement.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
      include: {
        product: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async count(where?: Prisma.StockMovementWhereInput) {
    return prisma.stockMovement.count({
      where: { ...where, deletedAt: null },
    });
  }

  async findById(id: string) {
    return prisma.stockMovement.findFirst({
      where: { id, deletedAt: null },
      include: {
        product: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async create(data: Prisma.StockMovementUncheckedCreateInput) {
    return prisma.stockMovement.create({
      data,
    });
  }
}

export const movementRepository = new MovementRepository();
