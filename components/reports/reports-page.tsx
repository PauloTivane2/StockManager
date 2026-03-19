"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  FileDown,
  Package,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { generateStockReport } from "@/components/reports/pdf";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";

const PIE_COLORS = [
  "var(--chart-primary)",
  "var(--chart-secondary)",
  "var(--chart-success)",
  "var(--chart-warning)",
  "var(--chart-danger)",
  "var(--chart-accent)"
];

const RADIAN = Math.PI / 180;
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltipLine = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-4 py-3 shadow-xl min-w-[160px]">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.stroke || p.fill }} />
            <span className="text-xs text-muted-foreground">{p.name}</span>
          </div>
          <span className="text-sm font-bold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltipPie = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN", minimumFractionDigits: 0 }).format(v);
  return (
    <div className="bg-card border border-border/60 rounded-xl px-4 py-3 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full" style={{ background: payload[0].payload.fill }} />
        <p className="text-sm font-semibold text-foreground">{payload[0].name}</p>
      </div>
      <p className="text-lg font-bold text-primary">{formatCurrency(payload[0].value)}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{payload[0].payload.count} produtos</p>
    </div>
  );
};

interface DbProduct {
  id: string;
  name: string;
  sku: string;
  price: string | number;
  costPrice: string | number;
  quantity: number;
  minStock: number;
  status: string;
  category: { id: string; name: string };
  supplier: { id: string; name: string } | null;
}

interface DbMovement {
  id: string;
  type: "ENTRY" | "EXIT" | "ADJUSTMENT" | "TRANSFER";
  quantity: number;
  createdAt: string;
}

export function ReportsPage() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [movements, setMovements] = useState<DbMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, movRes] = await Promise.all([
        fetch("/api/products?limit=500").then((r) => r.json()),
        fetch("/api/stock?limit=500").then((r) => r.json()),
      ]);
      setProducts(prodRes.data ?? []);
      setMovements(movRes.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN", minimumFractionDigits: 0 }).format(value);

  const insights = useMemo(() => {
    const totalValue = products.reduce((s, p) => s + p.quantity * Number(p.price), 0);
    const lowStockCount = products.filter((p) => p.quantity <= p.minStock).length;
    const totalEntries = movements.filter((m) => m.type === "ENTRY").reduce((s, m) => s + m.quantity, 0);
    const totalExits = movements.filter((m) => m.type === "EXIT").reduce((s, m) => s + m.quantity, 0);
    return { totalValue, lowStockCount, totalEntries, totalExits };
  }, [products, movements]);

  const categoryData = useMemo(() => {
    const map = new Map<string, { name: string; count: number; quantity: number; value: number; fill?: string }>();
    products.forEach((p) => {
      const ex = map.get(p.category.id) ?? { name: p.category.name, count: 0, quantity: 0, value: 0 };
      ex.count++;
      ex.quantity += p.quantity;
      ex.value += p.quantity * Number(p.price);
      map.set(p.category.id, ex);
    });
    return Array.from(map.values())
      .map((c, i) => ({ ...c, value: Math.round(c.value), fill: PIE_COLORS[i % PIE_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [products]);

  const topProducts = useMemo(() =>
    [...products]
      .map((p) => ({ ...p, stockValue: p.quantity * Number(p.price), value: p.quantity * Number(p.price) }))
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 10),
    [products]
  );

  // Top products bar chart data
  const topProductsChartData = useMemo(() =>
    topProducts.slice(0, 6).map((p) => ({
      name: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
      valor: Math.round(p.stockValue),
    })),
    [topProducts]
  );

  const movementTrend = useMemo(() => {
    const trend: Record<string, { entradas: number; saidas: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      trend[key] = { entradas: 0, saidas: 0 };
    }
    movements.forEach((m) => {
      const key = new Date(m.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (key in trend) {
        if (m.type === "ENTRY") trend[key].entradas += m.quantity;
        else if (m.type === "EXIT") trend[key].saidas += m.quantity;
      }
    });
    return Object.entries(trend).map(([date, data]) => ({ date, Entradas: data.entradas, Saídas: data.saidas }));
  }, [movements]);

  const exportToPDF = async () => {
    try {
      await generateStockReport({ insights: { ...insights, totalProducts: products.length }, categoryData, topProducts });
      notify.success("PDF exportado com sucesso.");
    } catch {
      notify.error("Erro ao gerar o PDF.");
    }
  };

  const kpis = [
    { label: "Valor Total do Estoque", value: formatCurrency(insights.totalValue), sub: `${products.length} produtos`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Itens em Alerta", value: insights.lowStockCount, sub: `${products.length > 0 ? ((insights.lowStockCount / products.length) * 100).toFixed(1) : 0}% do total`, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
    { label: "Total Entradas", value: insights.totalEntries, sub: "unidades recebidas", icon: ArrowUpCircle, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
    { label: "Total Saídas", value: insights.totalExits, sub: "unidades expedidas", icon: ArrowDownCircle, color: "text-danger", bg: "bg-danger/10", border: "border-danger/20" },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análise detalhada do seu estoque</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3"><CardSkeleton /></div>
          <div className="lg:col-span-2"><CardSkeleton /></div>
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <FileDown className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">Análise detalhada do seu estoque e movimentações</p>
          </div>
        </div>
        <Button onClick={exportToPDF} className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={cn("border overflow-hidden", kpi.border)}>
            <CardContent className="pt-5 pb-5 px-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{kpi.label}</p>
                  <p className={cn("text-3xl font-bold leading-none", kpi.color)}>{kpi.value}</p>
                </div>
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ml-3", kpi.bg)}>
                  <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Movement Trend — wide */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="pb-2 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Tendência de Movimentações</CardTitle>
                <CardDescription className="mt-0.5">Entradas vs Saídas — últimos 14 dias</CardDescription>
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
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={movementTrend}>
                <defs>
                  <linearGradient id="entryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-success)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--chart-success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-danger)" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="var(--chart-danger)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={35} allowDecimals={false} />
                <Tooltip content={<CustomTooltipLine />} />
                <Area type="monotone" dataKey="Entradas" stroke="var(--chart-success)" strokeWidth={2.5} fill="url(#entryFill)" dot={false} activeDot={{ r: 5, fill: "var(--chart-success)" }} />
                <Area type="monotone" dataKey="Saídas" stroke="var(--chart-danger)" strokeWidth={2.5} fill="url(#exitFill)" dot={false} activeDot={{ r: 5, fill: "var(--chart-danger)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Donut — narrow */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2 border-b border-border/50">
            <CardTitle className="text-base">Por Categoria</CardTitle>
            <CardDescription className="mt-0.5">Valor em estoque por categoria</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={PieLabel}
                  outerRadius={100}
                  innerRadius={50}
                  dataKey="value"
                  paddingAngle={3}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipPie />} />
                <Legend
                  iconType="circle"
                  iconSize={9}
                  formatter={(value) => <span style={{ fontSize: 12, color: "hsl(var(--foreground))" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 — Top Products Bar */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 border-b border-border/50">
          <CardTitle className="text-base">Top 6 Produtos por Valor em Estoque</CardTitle>
          <CardDescription className="mt-0.5">Comparação do valor total armazenado por produto (MZN)</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topProductsChartData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--chart-secondary)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-card border border-border/60 rounded-xl px-4 py-3 shadow-xl">
                      <p className="text-xs text-muted-foreground mb-1">{label}</p>
                      <p className="text-base font-bold text-primary">{formatCurrency(payload[0].value as number)}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="valor" fill="url(#barGrad)" radius={[0, 6, 6, 0]} maxBarSize={28} animationDuration={700} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Details Table */}
      <Card>
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-base">Análise Detalhada por Categoria</CardTitle>
          <CardDescription>Quantidade de produtos, unidades e valor em armazém</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-6">Categoria</TableHead>
                <TableHead className="text-right">Qtd Produtos</TableHead>
                <TableHead className="text-right">Unidades</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right pr-6">Valor Médio / Un.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryData.map((cat, i) => (
                <TableRow key={cat.name} className="hover:bg-muted/20">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.fill }} />
                      <span className="font-medium">{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{cat.count}</TableCell>
                  <TableCell className="text-right">{cat.quantity}</TableCell>
                  <TableCell className="text-right font-semibold text-foreground">{formatCurrency(cat.value)}</TableCell>
                  <TableCell className="text-right text-muted-foreground pr-6">
                    {formatCurrency(cat.quantity > 0 ? cat.value / cat.quantity : 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card>
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-base">Top 10 Produtos — Por Valor em Estoque</CardTitle>
          <CardDescription>Os produtos que representam maior capital imobilizado</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-6 w-8">#</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Qtd.</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right pr-6">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product, index) => (
                <TableRow key={product.id} className="hover:bg-muted/20">
                  <TableCell className="pl-6">
                    <span className={cn(
                      "text-xs font-bold w-6 h-6 rounded-full inline-flex items-center justify-center",
                      index === 0 ? "bg-warning/20 text-warning" :
                      index === 1 ? "bg-muted text-muted-foreground" :
                      index === 2 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">{product.sku}</TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {product.category.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(product.price))}</TableCell>
                  <TableCell className="text-right font-semibold text-foreground pr-6">
                    {formatCurrency(product.stockValue)}
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
