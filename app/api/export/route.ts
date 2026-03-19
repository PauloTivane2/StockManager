import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Gather stats for the export
  const [products, movements, categories, suppliers] = await Promise.all([
    prisma.product.findMany({ where: { deletedAt: null }, include: { category: true, supplier: true } }),
    prisma.stockMovement.findMany({ include: { product: true, user: true }, orderBy: { createdAt: "desc" }, take: 1000 }),
    prisma.category.findMany({ where: { deletedAt: null } }),
    prisma.supplier.findMany({ where: { deletedAt: null } }),
  ]);

  // Build CSV
  const csvLines: string[] = [];

  csvLines.push("=== PRODUTOS ===");
  csvLines.push("Nome,SKU,Categoria,Fornecedor,Preço,Custo,Quantidade,Stock Mínimo,Status");
  products.forEach((p) => {
    csvLines.push(
      [p.name, p.sku, p.category?.name ?? "", p.supplier?.name ?? "", p.price, p.costPrice, p.quantity, p.minStock, p.status].join(",")
    );
  });

  csvLines.push("");
  csvLines.push("=== MOVIMENTOS ===");
  csvLines.push("Data,Produto,Tipo,Quantidade,Anterior,Novo,Motivo");
  movements.forEach((m) => {
    csvLines.push(
      [new Date(m.createdAt).toLocaleDateString("pt-MZ"), m.product?.name ?? "", m.type, m.quantity, m.previousQuantity, m.newQuantity, m.reason ?? ""].join(",")
    );
  });

  csvLines.push("");
  csvLines.push("=== CATEGORIAS ===");
  csvLines.push("Nome,Descrição");
  categories.forEach((c) => csvLines.push([c.name, c.description ?? ""].join(",")));

  csvLines.push("");
  csvLines.push("=== FORNECEDORES ===");
  csvLines.push("Nome,Email,Telefone,Endereço");
  suppliers.forEach((s) => csvLines.push([s.name, s.email ?? "", s.phone ?? "", s.address ?? ""].join(",")));

  const csv = csvLines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kutenda-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
