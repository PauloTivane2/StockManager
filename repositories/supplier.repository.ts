import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class SupplierRepository {
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return prisma.supplier.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy,
    });
  }

  async count(where?: Prisma.SupplierWhereInput) {
    return prisma.supplier.count({
      where: { ...where, deletedAt: null },
    });
  }

  async findById(id: string) {
    return prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(data: Prisma.SupplierUncheckedCreateInput) {
    return prisma.supplier.create({
      data,
    });
  }

  async update(id: string, data: Prisma.SupplierUpdateInput) {
    return prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const supplierRepository = new SupplierRepository();
