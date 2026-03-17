"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  ArrowRightLeft,
  Package,
  Hash,
} from "lucide-react";

const movementSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  type: z.enum(["ENTRY", "EXIT", "ADJUSTMENT", "TRANSFER"]),
  quantity: z.number({ message: "Quantidade inválida" }).min(1, "Quantidade deve ser maior que 0"),
  reason: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface DbProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
}

interface MovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const FALLBACK_USER_ID = "admin-fallback-123";

const MOVEMENT_TYPES = [
  {
    value: "ENTRY",
    label: "Entrada",
    description: "Reposição de stock",
    icon: ArrowUpRight,
    color: "text-success",
    bg: "bg-success/10 border-success/30",
  },
  {
    value: "EXIT",
    label: "Saída",
    description: "Venda ou consumo",
    icon: ArrowDownRight,
    color: "text-danger",
    bg: "bg-danger/10 border-danger/30",
  },
  {
    value: "ADJUSTMENT",
    label: "Ajuste",
    description: "Correcção de inventário",
    icon: RefreshCcw,
    color: "text-warning",
    bg: "bg-warning/10 border-warning/30",
  },
  {
    value: "TRANSFER",
    label: "Transferência",
    description: "Mover entre armazéns",
    icon: ArrowRightLeft,
    color: "text-info",
    bg: "bg-info/10 border-info/30",
  },
];

const REASONS = [
  { value: "Venda", label: "Venda" },
  { value: "Reposição", label: "Reposição" },
  { value: "Dano", label: "Dano / Avaria" },
  { value: "Ajuste", label: "Ajuste de Inventário" },
  { value: "Devolução", label: "Devolução" },
  { value: "Inventário Inicial", label: "Inventário Inicial" },
];

export function MovementForm({ open, onOpenChange, onSaved }: MovementFormProps) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productId: "",
      type: "ENTRY",
      quantity: 1,
      reason: "",
    },
  });

  const selectedType = form.watch("type");
  const selectedProductId = form.watch("productId");
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (!open) return;
    fetch("/api/products?limit=200")
      .then((r) => r.json())
      .then((json) => setProducts(json.data ?? []));
  }, [open]);

  const onSubmit = async (data: MovementFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: FALLBACK_USER_ID }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao registar movimentação.");
        return;
      }

      const typeObj = MOVEMENT_TYPES.find((t) => t.value === data.type);
      toast.success(`${data.quantity} unidades registradas como ${typeObj?.label.toLowerCase() || data.type}`);
      onSaved();
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Erro ao registar movimentação.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <ArrowRightLeft className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">Registar Movimentação</DialogTitle>
              <DialogDescription>
                Registe entradas, saídas e ajustes de stock
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {/* Movement Type Selector */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Tipo de Movimentação
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {MOVEMENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = field.value === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          className={`flex items-center gap-2.5 rounded-lg border-2 p-3 text-left transition-all duration-200 ${
                            isSelected
                              ? `${type.bg} border-current ${type.color} shadow-sm`
                              : "border-transparent bg-muted/30 hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <Icon className={`h-4 w-4 flex-shrink-0 ${isSelected ? type.color : ""}`} />
                          <div>
                            <div className="text-sm font-medium">{type.label}</div>
                            <div className="text-[10px] opacity-70">{type.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Selector */}
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Package className="h-3 w-3" />
                    Produto
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-muted/30 border-border/60">
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <span>{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {product.sku}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs">
                        <Hash className="h-2.5 w-2.5 mr-1" />
                        {selectedProduct.sku}
                      </Badge>
                      <Badge
                        variant={selectedProduct.quantity > 0 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        Stock atual: {selectedProduct.quantity}
                      </Badge>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min={1}
                      className="h-11 text-lg font-semibold bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    />
                  </FormControl>
                  {selectedProduct && field.value > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Novo stock:{" "}
                      <span className="font-medium text-foreground">
                        {selectedType === "ENTRY" || selectedType === "ADJUSTMENT"
                          ? selectedProduct.quantity + field.value
                          : Math.max(0, selectedProduct.quantity - field.value)}
                      </span>{" "}
                      unidades
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo (Opcional)</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-10 bg-muted/30 border-border/60">
                        <SelectValue placeholder="Selecione um motivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[160px] bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A registar...
                  </>
                ) : (
                  "Registar Movimentação"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
