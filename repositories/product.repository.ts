import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class ProductRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return prisma.product.findMany({
      skip,
      take,
      cursor,
      where: { ...where, deletedAt: null },
      orderBy,
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  async count(where?: Prisma.ProductWhereInput) {
    return prisma.product.count({
      where: { ...where, deletedAt: null },
    });
  }

  async findById(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  async create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const productRepository = new ProductRepository();
