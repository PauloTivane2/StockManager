"use client";

import { useInventoryStore } from "@/lib/store";
import { KPICard } from "./kpi-card";
import { InventoryOverviewChart } from "./charts/inventory-overview-chart";
import { MovementActivityChart } from "./charts/movement-activity-chart";
import { LowStockAlert } from "./low-stock-alert";
import { RecentMovementsTable } from "./recent-movements-table";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Dashboard() {
  const {
    getProductCount,
    getTotalInventoryValue,
    getLowStockItems,
    getRecentMovements,
  } = useInventoryStore();

  const totalProducts = getProductCount();
  const totalValue = getTotalInventoryValue();
  const lowStockItems = getLowStockItems();
  const recentMovements = getRecentMovements(7);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);
  };

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
        <KPICard
          title="Total de Produtos"
          value={totalProducts}
          description={`${totalProducts} itens em estoque`}
          icon={Package}
        />
        <KPICard
          title="Valor Total"
          value={formatCurrency(totalValue)}
          description="Valor total do estoque"
          icon={TrendingUp}
        />
        <KPICard
          title="Itens em Alerta"
          value={lowStockItems.length}
          description="Produtos com baixo estoque"
          icon={AlertTriangle}
        />
        <KPICard
          title="Movimentações (7d)"
          value={recentMovements.length}
          description="Movimentações da última semana"
          icon={Activity}
        />
      </div>

      {/* Alerts and Charts */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Inventory Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Estoque por Categoria</CardTitle>
              <CardDescription>
                Quantidade de produtos em cada categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryOverviewChart />
            </CardContent>
          </Card>

          {/* Movement Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade de Movimentações</CardTitle>
              <CardDescription>
                Entradas e saídas nos últimos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MovementActivityChart />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Low Stock Alert */}
        <div>
          <LowStockAlert items={lowStockItems} />
        </div>
      </div>

      {/* Recent Movements */}
      <RecentMovementsTable movements={recentMovements} />
    </div>
  );
}
