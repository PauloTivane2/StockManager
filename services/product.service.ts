import { productRepository } from "@/repositories/product.repository";
import { Prisma } from "@prisma/client";

export class ProductService {
  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { sku: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    const [products, total] = await Promise.all([
      productRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: "desc" },
      }),
      productRepository.count(where),
    ]);

    return {
      data: products,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    return productRepository.findById(id);
  }

  async createProduct(data: Prisma.ProductUncheckedCreateInput) {
    // Add business logic here, e.g., checking if SKU exists
    return productRepository.create(data);
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return productRepository.update(id, data);
  }

  async deleteProduct(id: string) {
    return productRepository.softDelete(id);
  }
}

export const productService = new ProductService();
