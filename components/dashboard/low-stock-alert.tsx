"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  price: string | number;
}

export function LowStockAlert() {
  const [items, setItems] = useState<LowStockProduct[]>([]);

  useEffect(() => {
    fetch("/api/products?limit=500")
      .then((r) => r.json())
      .then((json) => {
        const products = json.data ?? [];
        setItems(products.filter((p: LowStockProduct) => p.quantity <= p.minStock));
      });
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <Card className="border-warning/30 bg-warning/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <CardTitle className="text-base">Itens em Alerta</CardTitle>
        </div>
        <CardDescription className="text-warning">
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
                  className="border-l-2 border-warning bg-card p-3 rounded text-sm"
                >
                  <p className="font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quantidade: {product.quantity}
                  </p>
                  <p className="text-xs text-warning font-medium mt-1">
                    Mínimo: {product.minStock}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(Number(product.price))}/un
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
