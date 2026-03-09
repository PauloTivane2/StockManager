"use client";

import { useMemo } from "react";
import { Movement } from "@/types";
import { useInventoryStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { MovementType } from "@/types";

interface RecentMovementsTableProps {
  movements: Movement[];
}

export function RecentMovementsTable({ movements }: RecentMovementsTableProps) {
  const { getProduct } = useInventoryStore();

  const movementsWithNames = useMemo(
    () =>
      movements.map((movement) => ({
        ...movement,
        productName: getProduct(movement.productId)?.name || "Produto não encontrado",
      })),
    [movements, getProduct]
  );

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentações Recentes</CardTitle>
        <CardDescription>Últimas movimentações de estoque</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movementsWithNames.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  <Badge
                    variant={
                      movement.type === MovementType.ENTRY
                        ? "default"
                        : "secondary"
                    }
                    className="flex w-fit items-center gap-1"
                  >
                    {movement.type === MovementType.ENTRY ? (
                      <>
                        <ArrowUpRight className="h-3 w-3" />
                        Entrada
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-3 w-3" />
                        Saída
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{movement.productName}</TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {movement.reason || "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(movement.date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
