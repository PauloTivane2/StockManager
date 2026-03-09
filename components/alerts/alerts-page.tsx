"use client";

import { useMemo, useState } from "react";
import { useInventoryStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
  productId?: string;
  productName?: string;
  timestamp: Date;
  acknowledged: boolean;
}

export function AlertsPage() {
  const { products, movements, getProduct } = useInventoryStore();
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(
    new Set()
  );

  const alerts = useMemo(() => {
    const generatedAlerts: Alert[] = [];

    // Low stock alerts
    products.forEach((product) => {
      if (product.quantity <= product.minimumStock) {
        generatedAlerts.push({
          id: `alert_low_${product.id}`,
          type: "warning",
          title: "Estoque Baixo",
          description: `${product.name} está abaixo do estoque mínimo. Quantidade atual: ${product.quantity} ${product.unit}, Mínimo: ${product.minimumStock} ${product.unit}`,
          productId: product.id,
          productName: product.name,
          timestamp: product.lastUpdated,
          acknowledged: false,
        });
      }
    });

    // Out of stock alerts
    products.forEach((product) => {
      if (product.quantity === 0) {
        generatedAlerts.push({
          id: `alert_out_${product.id}`,
          type: "danger",
          title: "Fora do Estoque",
          description: `${product.name} está sem estoque. Reposição urgente recomendada.`,
          productId: product.id,
          productName: product.name,
          timestamp: product.lastUpdated,
          acknowledged: false,
        });
      }
    });

    // High value products alerts
    products.forEach((product) => {
      const totalValue = product.quantity * product.unitPrice;
      if (totalValue > 100000 && product.quantity < product.minimumStock * 2) {
        generatedAlerts.push({
          id: `alert_value_${product.id}`,
          type: "info",
          title: "Produto de Alto Valor",
          description: `${product.name} tem valor em estoque de ${new Intl.NumberFormat("pt-MZ", {
            style: "currency",
            currency: "MZN",
          }).format(totalValue)} e quantidade baixa.`,
          productId: product.id,
          productName: product.name,
          timestamp: product.lastUpdated,
          acknowledged: false,
        });
      }
    });

    // Recent high movement alerts
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentMovements = movements.filter((m) => {
      const movementDate = typeof m.date === 'string' ? new Date(m.date) : m.date;
      return movementDate >= last7Days;
    });

    if (recentMovements.length > 30) {
      generatedAlerts.push({
        id: "alert_high_activity",
        type: "info",
        title: "Alta Atividade",
        description: `Foram registradas ${recentMovements.length} movimentações nos últimos 7 dias. Atividade acima do normal.`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    return generatedAlerts.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [products, movements]);

  const toggleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts((prev) => {
      const updated = new Set(prev);
      if (updated.has(alertId)) {
        updated.delete(alertId);
      } else {
        updated.add(alertId);
      }
      return updated;
    });
  };

  const dangerAlerts = alerts.filter(
    (a) => a.type === "danger" && !acknowledgedAlerts.has(a.id)
  );
  const warningAlerts = alerts.filter(
    (a) => a.type === "warning" && !acknowledgedAlerts.has(a.id)
  );
  const infoAlerts = alerts.filter(
    (a) => a.type === "info" && !acknowledgedAlerts.has(a.id)
  );
  const acknowledgedCount = acknowledgedAlerts.size;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getAlertIcon = (type: "warning" | "danger" | "info") => {
    switch (type) {
      case "danger":
        return <XCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (type: "warning" | "danger" | "info") => {
    switch (type) {
      case "danger":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-orange-200 bg-orange-50";
      case "info":
        return "border-blue-200 bg-blue-50";
    }
  };

  const getAlertIconColor = (type: "warning" | "danger" | "info") => {
    switch (type) {
      case "danger":
        return "text-red-600";
      case "warning":
        return "text-orange-600";
      case "info":
        return "text-blue-600";
    }
  };

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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dangerAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requerem ação imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avisos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {warningAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Atenção necessária
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {infoAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Para sua informação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reconhecidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {acknowledgedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alertas confirmados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {/* Critical Alerts */}
        {dangerAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Alertas Críticos
            </h2>
            <div className="space-y-2">
              {dangerAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-2 ${getAlertColor(alert.type)}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <div
                          className={`flex-shrink-0 ${getAlertIconColor(
                            alert.type
                          )}`}
                        >
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">
                            {alert.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(alert.timestamp)}
                          </p>
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
              ))}
            </div>
          </div>
        )}

        {/* Warning Alerts */}
        {warningAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Avisos
            </h2>
            <div className="space-y-2">
              {warningAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`${getAlertColor(alert.type)}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <div
                          className={`flex-shrink-0 ${getAlertIconColor(
                            alert.type
                          )}`}
                        >
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">
                            {alert.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(alert.timestamp)}
                          </p>
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
              ))}
            </div>
          </div>
        )}

        {/* Info Alerts */}
        {infoAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Informações
            </h2>
            <div className="space-y-2">
              {infoAlerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`${getAlertColor(alert.type)}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1">
                        <div
                          className={`flex-shrink-0 ${getAlertIconColor(
                            alert.type
                          )}`}
                        >
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">
                            {alert.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(alert.timestamp)}
                          </p>
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
              ))}
            </div>
          </div>
        )}

        {/* Acknowledged Alerts */}
        {acknowledgedCount > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Alertas Confirmados ({acknowledgedCount})
            </h2>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>
                    Você confirmou {acknowledgedCount} alerta(s). Continue
                    monitorando seu estoque.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Alerts */}
        {dangerAlerts.length === 0 &&
          warningAlerts.length === 0 &&
          infoAlerts.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-foreground">
                    Tudo Ok!
                  </p>
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
