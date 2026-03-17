import { supplierRepository } from "@/repositories/supplier.repository";
import { Prisma } from "@prisma/client";

export class SupplierService {
  async getSuppliers(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      supplierRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { name: "asc" },
      }),
      supplierRepository.count(where),
    ]);

    return {
      data: suppliers,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const supplierService = new SupplierService();
