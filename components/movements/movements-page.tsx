"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
import { toast } from "sonner";
import { Plus, ArrowDownRight, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";

export interface DbMovement {
  id: string;
  type: "ENTRY" | "EXIT" | "ADJUSTMENT" | "TRANSFER";
  quantity: number;
  reason: string | null;
  previousQuantity: number;
  newQuantity: number;
  productId: string;
  userId: string;
  createdAt: string;
  product: { id: string; name: string; sku: string };
  user: { id: string; name: string };
}

export function MovementsPage() {
  const [movements, setMovements] = useState<DbMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDays, setFilterDays] = useState<string>("30");

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filterType !== "all") params.set("type", filterType.toUpperCase());
      const res = await fetch(`/api/stock?${params}`);
      const json = await res.json();
      setMovements(json.data ?? []);
    } catch {
      toast.error("Erro ao carregar movimentações.");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const filteredMovements = useMemo(() => {
    const days = parseInt(filterDays);
    const pastDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return movements.filter((m) => {
      const date = new Date(m.createdAt);
      if (date < pastDate) return false;

      if (searchTerm) {
        return (
          m.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.reason?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    });
  }, [movements, filterDays, searchTerm]);

  const stats = useMemo(() => {
    const entries = filteredMovements
      .filter((m) => m.type === "ENTRY")
      .reduce((sum, m) => sum + m.quantity, 0);
    const exits = filteredMovements
      .filter((m) => m.type === "EXIT")
      .reduce((sum, m) => sum + m.quantity, 0);
    return { entries, exits };
  }, [filteredMovements]);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      ENTRY: "Entrada",
      EXIT: "Saída",
      ADJUSTMENT: "Ajuste",
      TRANSFER: "Transferência",
    };
    return map[type] ?? type;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <ArrowRightLeft className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Movimentações</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Histórico de entradas e saídas de estoque
            </p>
          </div>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
        >
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
            <div className="text-2xl font-bold text-success">{stats.entries}</div>
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
            <div className="text-2xl font-bold text-danger">{stats.exits}</div>
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
            <SelectItem value="ENTRY">Entradas</SelectItem>
            <SelectItem value="EXIT">Saídas</SelectItem>
            <SelectItem value="ADJUSTMENT">Ajustes</SelectItem>
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
            {loading ? <Skeleton className="h-4 w-48 mt-1" /> : `${filteredMovements.length} movimentação(ões) encontrada(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton columns={7} rows={6} />
          ) : filteredMovements.length === 0 ? (
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
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <Badge
                          variant={
                            movement.type === "ENTRY"
                              ? "default"
                              : movement.type === "EXIT"
                              ? "secondary"
                              : "outline"
                          }
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
                        <span className="text-xs text-muted-foreground ml-1">
                          ({movement.product.sku})
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {movement.previousQuantity} → {movement.newQuantity}
                      </TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>

      <MovementForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={fetchMovements}
      />
    </div>
  );
}
