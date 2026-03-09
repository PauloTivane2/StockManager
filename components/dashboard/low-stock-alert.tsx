"use client";

import { Product } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LowStockAlertProps {
  items: Product[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-base">Itens em Alerta</CardTitle>
        </div>
        <CardDescription className="text-orange-700">
          {items.length} produto(s) com baixo estoque
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item em alerta</p>
        ) : (
          <ScrollArea className="h-80 pr-4">
            <div className="space-y-3">
              {items.map((product) => (
                <div
                  key={product.id}
                  className="border-l-2 border-orange-400 bg-white p-3 rounded text-sm"
                >
                  <p className="font-medium text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {product.quantity} {product.unit}
                  </p>
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    Min: {product.minimumStock} {product.unit}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(product.unitPrice)}/un
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
