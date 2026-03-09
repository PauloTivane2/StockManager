"use client";

import { useMemo } from "react";
import { useInventoryStore } from "@/lib/store";
import { Category, MovementType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Package } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export function ReportsPage() {
  const { products, movements } = useInventoryStore();

  // Calculate insights
  const insights = useMemo(() => {
    const totalValue = products.reduce(
      (sum, p) => sum + p.quantity * p.unitPrice,
      0
    );
    const lowStockCount = products.filter(
      (p) => p.quantity <= p.minimumStock
    ).length;
    
    const totalEntries = movements
      .filter((m) => m.type === MovementType.ENTRY)
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const totalExits = movements
      .filter((m) => m.type === MovementType.EXIT)
      .reduce((sum, m) => sum + m.quantity, 0);

    return {
      totalValue,
      lowStockCount,
      totalEntries,
      totalExits,
    };
  }, [products, movements]);

  // Category breakdown
  const categoryData = useMemo(() => {
    return Object.values(Category).map((category) => {
      const categoryProducts = products.filter((p) => p.category === category);
      const value = categoryProducts.reduce(
        (sum, p) => sum + p.quantity * p.unitPrice,
        0
      );
      return {
        name: category,
        value: Math.round(value),
        count: categoryProducts.length,
        quantity: categoryProducts.reduce((sum, p) => sum + p.quantity, 0),
      };
    });
  }, [products]);

  // Top products by value
  const topProducts = useMemo(() => {
    return products
      .map((p) => ({
        ...p,
        value: p.quantity * p.unitPrice,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [products]);

  // Movement trend (last 14 days)
  const movementTrend = useMemo(() => {
    const trend: Record<string, { entries: number; exits: number }> = {};

    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString("pt-BR", {
        month: "2-digit",
        day: "2-digit",
      });
      trend[key] = { entries: 0, exits: 0 };
    }

    movements.forEach((movement) => {
      const movementDate = typeof movement.date === 'string' 
        ? new Date(movement.date) 
        : movement.date;
      
      const key = movementDate.toLocaleDateString("pt-BR", {
        month: "2-digit",
        day: "2-digit",
      });
      if (key in trend) {
        if (movement.type === MovementType.ENTRY) {
          trend[key].entries += movement.quantity;
        } else {
          trend[key].exits += movement.quantity;
        }
      }
    });

    return Object.entries(trend).map(([date, data]) => ({
      date,
      ...data,
    }));
  }, [movements]);

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
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Análise detalhada do seu estoque e movimentações
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total do Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(insights.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {products.length} produtos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Itens em Alerta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {insights.lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((insights.lowStockCount / products.length) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {insights.totalEntries}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os períodos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {insights.totalExits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os períodos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Movement Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Movimentações</CardTitle>
            <CardDescription>Últimos 14 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={movementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="entries"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Entradas"
                />
                <Line
                  type="monotone"
                  dataKey="exits"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Saídas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>Valor total em estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Categoria</CardTitle>
          <CardDescription>Detalhes de quantidade e valor</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Produtos</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Valor Médio/Item</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryData.map((category) => (
                <TableRow key={category.name}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">{category.count}</TableCell>
                  <TableCell className="text-right">{category.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(category.value)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(
                      category.quantity > 0
                        ? category.value / category.quantity
                        : 0
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos</CardTitle>
          <CardDescription>Por valor em estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    {product.quantity} {product.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
