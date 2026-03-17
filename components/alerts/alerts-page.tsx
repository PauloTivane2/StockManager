"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  category: { name: string };
}

interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  timestamp: Date;
}

export function AlertsPage() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all active products to compute alerts
      const res = await fetch("/api/products?limit=500");
      const json = await res.json();
      setProducts(json.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Derive alerts from real product data
  const alerts: Alert[] = [];

  products.forEach((p) => {
    if (p.quantity === 0) {
      alerts.push({
        id: `out_${p.id}`,
        type: "danger",
        title: "Fora do Estoque",
        description: `${p.name} (${p.sku}) está sem estoque. Reposição urgente recomendada.`,
        timestamp: new Date(),
      });
    } else if (p.quantity <= p.minStock) {
      alerts.push({
        id: `low_${p.id}`,
        type: "warning",
        title: "Estoque Baixo",
        description: `${p.name} (${p.sku}) — Quantidade atual: ${p.quantity}, Mínimo definido: ${p.minStock}.`,
        timestamp: new Date(),
      });
    }
  });

  const toggleAcknowledge = (id: string) => {
    setAcknowledged((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const dangerAlerts = alerts.filter((a) => a.type === "danger" && !acknowledged.has(a.id));
  const warningAlerts = alerts.filter((a) => a.type === "warning" && !acknowledged.has(a.id));
  const infoAlerts = alerts.filter((a) => a.type === "info" && !acknowledged.has(a.id));
  const acknowledgedCount = acknowledged.size;

  const getAlertIcon = (type: "warning" | "danger" | "info") => {
    switch (type) {
      case "danger": return <XCircle className="h-5 w-5" />;
      case "warning": return <AlertTriangle className="h-5 w-5" />;
      case "info": return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (type: "warning" | "danger" | "info") => {
    switch (type) {
      case "danger": return "border-danger/30 bg-danger/10";
      case "warning": return "border-warning/30 bg-warning/10";
      case "info": return "border-info/30 bg-info/10";
    }
  };

  const getAlertIconColor = (type: "warning" | "danger" | "info") => {
    switch (type) {
      case "danger": return "text-danger";
      case "warning": return "text-warning";
      case "info": return "text-info";
    }
  };

  const AlertCard = ({ alert }: { alert: Alert }) => (
    <Card className={`${getAlertColor(alert.type)} border`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1">
            <div className={`flex-shrink-0 ${getAlertIconColor(alert.type)}`}>
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{alert.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleAcknowledge(alert.id)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirmar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alertas</h1>
        <p className="text-muted-foreground mt-1">
          Monitore problemas e situações importantes do seu estoque
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Alertas Críticos", value: dangerAlerts.length, color: "text-danger", sub: "Requerem ação imediata" },
          { label: "Avisos", value: warningAlerts.length, color: "text-warning", sub: "Atenção necessária" },
          { label: "Informações", value: infoAlerts.length, color: "text-info", sub: "Para sua informação" },
          { label: "Reconhecidos", value: acknowledgedCount, color: "text-success", sub: "Alertas confirmados" },
        ].map(({ label, value, color, sub }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <div className={`text-2xl font-bold ${color} mt-1`}>{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-6">
        {loading && (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {!loading && dangerAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Alertas Críticos</h2>
            <div className="space-y-2">
              {dangerAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
            </div>
          </div>
        )}

        {!loading && warningAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Avisos</h2>
            <div className="space-y-2">
              {warningAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
            </div>
          </div>
        )}

        {!loading && infoAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Informações</h2>
            <div className="space-y-2">
              {infoAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)}
            </div>
          </div>
        )}

        {acknowledgedCount > 0 && (
          <Card className="border-success/30 bg-success/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="h-5 w-5" />
                <span>Você confirmou {acknowledgedCount} alerta(s). Continue monitorando o seu estoque.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading &&
          dangerAlerts.length === 0 &&
          warningAlerts.length === 0 &&
          infoAlerts.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                  <p className="text-lg font-semibold text-foreground">Tudo Ok!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Não há alertas pendentes no momento
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
