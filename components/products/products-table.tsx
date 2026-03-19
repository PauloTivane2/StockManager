"use client";

import { useState, useMemo } from "react";
import { DbProduct } from "./products-page";
import { useDialog } from "@/hooks/use-dialog";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, AlertTriangle } from "lucide-react";

interface ProductsTableProps {
  products: DbProduct[];
  loading: boolean;
  onEdit: (product: DbProduct) => void;
  onDelete: (id: string) => void;
}

export function ProductsTable({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "quantity" | "value">("name");
  const { dangerDialog } = useDialog();

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    products.forEach((p) => unique.set(p.categoryId, p.category.name));
    return Array.from(unique.entries());
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "quantity":
          return b.quantity - a.quantity;
        case "value":
          return (
            b.quantity * Number(b.price) - a.quantity * Number(a.price)
          );
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);

  const handleDeleteClick = (id: string, name: string) => {
    dangerDialog({
      title: "Excluir Produto?",
      description: `Tem certeza que deseja excluir "${name}"? Esta acção é permanente e não pode ser desfeita.`,
      confirmLabel: "Sim, excluir",
      onConfirm: async () => {
        try {
          await onDelete(id);
          notify.success("Produto eliminado", `"${name}" foi removido com sucesso.`);
        } catch {
          notify.error("Erro ao eliminar", `Não foi possível excluir "${name}". Tente novamente.`);
        }
      },
    });
  };

  if (loading) {
    return <TableSkeleton columns={8} rows={8} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-col sm:flex-row">
        <Input
          placeholder="Buscar por nome ou SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="quantity">Quantidade</SelectItem>
            <SelectItem value="value">Valor Total</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Preço Unit.</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSorted.map((product) => {
              const isLowStock = product.quantity <= product.minStock;
              const totalValue = product.quantity * Number(product.price);

              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{product.sku}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(product.price))}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(totalValue)}
                  </TableCell>
                  <TableCell className="text-center">
                    {isLowStock ? (
                      <Badge
                        variant="destructive"
                        className="flex w-fit mx-auto items-center gap-1"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Baixo
                      </Badge>
                    ) : (
                      <Badge variant="outline">OK</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(product.id, product.name)}
                          className="text-danger"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {filteredAndSorted.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      )}

    </div>
  );
}
