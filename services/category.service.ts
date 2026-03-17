import { categoryRepository } from "@/repositories/category.repository";
import { Prisma } from "@prisma/client";

export class CategoryService {
  async getCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [categories, total] = await Promise.all([
      categoryRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { name: "asc" },
      }),
      categoryRepository.count(where),
    ]);

    return {
      data: categories,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const categoryService = new CategoryService();
