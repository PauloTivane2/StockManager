"use client";

import { useEffect, useState, useCallback } from "react";
import { KPICard } from "./kpi-card";
import { InventoryOverviewChart } from "./charts/inventory-overview-chart";
import { MovementActivityChart } from "./charts/movement-activity-chart";
import { LowStockAlert } from "./low-stock-alert";
import { RecentMovementsTable } from "./recent-movements-table";
import { Package, AlertTriangle, TrendingUp, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, CardSkeleton, TableSkeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockAlerts: number;
  pendingOrdersCount: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalInventoryValue: 0,
    lowStockAlerts: 0,
    pendingOrdersCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data);
    } catch {
      // keep defaults
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (value: number) =>
    `${new Intl.NumberFormat("pt-MZ", {
      minimumFractionDigits: 0,
    }).format(value)} MZN`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do seu estoque e operações
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <KPICard
          title="Total de Produtos"
          value={stats.totalProducts}
          description="itens em catálogo"
          icon={Package}
          color="primary"
        />
        <KPICard
          title="Valor do Estoque"
          value={formatCurrency(stats.totalInventoryValue)}
          description="valor total em armazém"
          icon={TrendingUp}
          color="success"
        />
        <KPICard
          title="Itens em Alerta"
          value={stats.lowStockAlerts}
          description="abaixo do stock mínimo"
          icon={AlertTriangle}
          color="warning"
        />
        <KPICard
          title="Pedidos Pendentes"
          value={stats.pendingOrdersCount}
          description="aguardando processamento"
          icon={ArrowRightLeft}
          color="info"
        />
          </>
        )}
      </div>

      {/* Charts + Alerts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Movement Activity */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Atividade de Movimentações</CardTitle>
                  <CardDescription className="mt-0.5">
                    Entradas e saídas nos últimos 7 dias
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-success" />
                    <span className="text-muted-foreground">Entradas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-danger" />
                    <span className="text-muted-foreground">Saídas</span>
                  </div>
                </div>
              </div>
            </CardHeader>
             <CardContent className="pt-4 pb-2">
              {isLoading ? (
                <Skeleton className="w-full h-[280px]" />
              ) : (
                <MovementActivityChart />
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/50">
              <div>
                <CardTitle className="text-base">Distribuição por Categoria</CardTitle>
                <CardDescription className="mt-0.5">
                  Proporção de produtos em cada categoria
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-2">
              {isLoading ? (
                <Skeleton className="w-full h-[280px]" />
              ) : (
                <InventoryOverviewChart />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div>
          {isLoading ? <CardSkeleton /> : <LowStockAlert />}
        </div>
      </div>

      {/* Recent Movements */}
      <RecentMovementsTable />
    </div>
  );
}
