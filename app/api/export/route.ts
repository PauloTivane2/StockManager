import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // Altera cotações internas para dupla cotação (standard CSV) e envolve tudo em aspas
  return `"${str.replace(/"/g, '""')}"`;
}

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
  
  // BOM to make excel parse UTF-8 characters properly
  const BOM = "\uFEFF";

  csvLines.push("RELATÓRIO GERAL DO SISTEMA - KUTENDA");
  csvLines.push(`Data de Exportação: ${new Date().toLocaleString("pt-MZ")}`);
  csvLines.push("");

  csvLines.push("=== PRODUTOS ===");
  csvLines.push(["Nome", "SKU", "Categoria", "Fornecedor", "Preço de Venda (MZN)", "Custo (MZN)", "Stock Atual", "Stock Mín.", "Estado"].map(escapeCsv).join(","));
  products.forEach((p) => {
    csvLines.push([
      p.name,
      p.sku,
      p.category?.name ?? "N/A",
      p.supplier?.name ?? "N/A",
      Number(p.price).toFixed(2),
      Number(p.costPrice).toFixed(2),
      p.quantity,
      p.minStock,
      p.status === "ACTIVE" ? "Ativo" : p.status === "INACTIVE" ? "Inativo" : p.status === "DISCONTINUED" ? "Descontinuado" : p.status
    ].map(escapeCsv).join(","));
  });

  csvLines.push("");
  csvLines.push("=== MOVIMENTOS DE ESTOQUE (Últimos 1000) ===");
  csvLines.push(["Data e Hora", "Produto", "Tipo", "Qtd. Movimentada", "Stock Ant.", "Stock Novo", "Motivo", "Responsável"].map(escapeCsv).join(","));
  
  const typeMap: Record<string, string> = {
    ENTRY: "Entrada",
    EXIT: "Saída",
    ADJUSTMENT: "Ajuste",
    TRANSFER: "Transferência"
  };

  movements.forEach((m) => {
    csvLines.push([
      new Date(m.createdAt).toLocaleString("pt-MZ"),
      m.product?.name ?? "Produto Eliminado",
      typeMap[m.type] || m.type,
      m.quantity,
      m.previousQuantity,
      m.newQuantity,
      m.reason ?? "",
      m.user?.name ?? "Sistema"
    ].map(escapeCsv).join(","));
  });

  csvLines.push("");
  csvLines.push("=== CATEGORIAS ===");
  csvLines.push(["Nome da Categoria", "Descrição"].map(escapeCsv).join(","));
  categories.forEach((c) => csvLines.push([c.name, c.description ?? ""].map(escapeCsv).join(",")));

  csvLines.push("");
  csvLines.push("=== FORNECEDORES ===");
  csvLines.push(["Nome", "Email", "Telefone", "Endereço Físico"].map(escapeCsv).join(","));
  suppliers.forEach((s) => csvLines.push([s.name, s.email ?? "", s.phone ?? "", s.address ?? ""].map(escapeCsv).join(",")));

  const csv = BOM + csvLines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kutenda-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
