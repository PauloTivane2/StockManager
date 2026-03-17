import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class CategoryRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.category.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
    });
  }

  async count(where?: Prisma.CategoryWhereInput) {
    return prisma.category.count({
      where: { ...where, deletedAt: null },
    });
  }

  async findById(id: string) {
    return prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const categoryRepository = new CategoryRepository();
