"use client";

import { useEffect, useState } from "react";
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

interface DbMovement {
  id: string;
  type: "ENTRY" | "EXIT" | "ADJUSTMENT" | "TRANSFER";
  quantity: number;
  reason: string | null;
  createdAt: string;
  product: { id: string; name: string; sku: string };
  user: { id: string; name: string };
}

export function RecentMovementsTable() {
  const [movements, setMovements] = useState<DbMovement[]>([]);

  useEffect(() => {
    fetch("/api/stock?limit=10")
      .then((r) => r.json())
      .then((json) => setMovements(json.data ?? []));
  }, []);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  const getTypeLabel = (type: string) =>
    ({ ENTRY: "Entrada", EXIT: "Saída", ADJUSTMENT: "Ajuste", TRANSFER: "Transferência" }[type] ?? type);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentações Recentes</CardTitle>
        <CardDescription>Últimas movimentações de estoque</CardDescription>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma movimentação registrada</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Utilizador</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <Badge
                      variant={movement.type === "ENTRY" ? "default" : "secondary"}
                      className="flex w-fit items-center gap-1"
                    >
                      {movement.type === "ENTRY" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {getTypeLabel(movement.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {movement.product.name}
                    <span className="text-xs text-muted-foreground ml-1">({movement.product.sku})</span>
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {movement.reason || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {movement.user.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(movement.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
