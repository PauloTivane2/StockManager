"use client";

import { useState, useMemo } from "react";
import { Movement, MovementType } from "@/types";
import { useInventoryStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MovementForm } from "./movement-form";
import { Plus, ArrowDownRight, ArrowUpRight } from "lucide-react";

export function MovementsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDays, setFilterDays] = useState<string>("7");

  const { movements, getProduct } = useInventoryStore();

  const filteredMovements = useMemo(() => {
    const days = parseInt(filterDays);
    const pastDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    let filtered = movements.filter((m) => {
      const movementDate = typeof m.date === 'string' ? new Date(m.date) : m.date;
      return movementDate >= pastDate;
    });

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(
        (m) => m.type === (filterType === "entry" ? MovementType.ENTRY : MovementType.EXIT)
      );
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter((m) => {
        const product = getProduct(m.productId);
        return (
          product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered.sort((a, b) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
      const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
      return dateB.getTime() - dateA.getTime();
    });
  }, [movements, filterType, searchTerm, filterDays, getProduct]);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const stats = useMemo(() => {
    const entries = filteredMovements
      .filter((m) => m.type === MovementType.ENTRY)
      .reduce((sum, m) => sum + m.quantity, 0);
    const exits = filteredMovements
      .filter((m) => m.type === MovementType.EXIT)
      .reduce((sum, m) => sum + m.quantity, 0);

    return { entries, exits };
  }, [filteredMovements]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Movimentações</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de entradas e saídas de estoque
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Movimentação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.entries}</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos {filterDays} dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.exits}</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos {filterDays} dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMovements.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total registrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por produto ou motivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="entry">Entradas</SelectItem>
            <SelectItem value="exit">Saídas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDays} onValueChange={setFilterDays}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Últimas 24h</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>
            {filteredMovements.length} movimentação(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma movimentação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => {
                    const product = getProduct(movement.productId);
                    return (
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
                        <TableCell className="font-medium">
                          {product?.name || "Produto removido"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {movement.quantity}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {movement.reason || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {movement.notes || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(movement.date)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MovementForm open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
