"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DbProduct } from "./products-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Package, Tag, Hash, DollarSign, Layers, Truck, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU é obrigatório"),
  price: z.number({ message: "Preço inválido" }).min(0, "Preço deve ser positivo"),
  costPrice: z.number({ message: "Preço inválido" }).min(0, "Preço de custo deve ser positivo"),
  quantity: z.number({ message: "Quantidade inválida" }).min(0),
  minStock: z.number({ message: "Quantidade inválida" }).min(0),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  supplierId: z.string().optional().or(z.literal("")),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: DbProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function ProductForm({ product, open, onOpenChange, onSaved }: ProductFormProps) {
  const isEditing = !!product;
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: 0,
      costPrice: 0,
      quantity: 0,
      minStock: 0,
      categoryId: "",
      supplierId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/categories?limit=100").then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()),
    ]).then(([catRes, supRes]) => {
      setCategories(catRes.data ?? catRes ?? []);
      setSuppliers(supRes.data ?? supRes ?? []);
    });
  }, [open]);

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        sku: product.sku,
        price: Number(product.price),
        costPrice: Number(product.costPrice),
        quantity: product.quantity,
        minStock: product.minStock,
        categoryId: product.categoryId,
        supplierId: product.supplierId || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        sku: "",
        price: 0,
        costPrice: 0,
        quantity: 0,
        minStock: 0,
        categoryId: "",
        supplierId: "",
      });
    }
  }, [product, form]);

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const url = isEditing ? `/api/products/${product.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const submissionData = {
        ...data,
        supplierId: data.supplierId === "none" || !data.supplierId ? null : data.supplierId,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao salvar produto.");
        return;
      }

      toast.success(isEditing ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
      onSaved();
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Erro ao salvar produto.");
    } finally {
      setSubmitting(false);
    }
  };

  const margin = form.watch("price") - form.watch("costPrice");
  const marginPercent = form.watch("costPrice") > 0
    ? ((margin / form.watch("costPrice")) * 100).toFixed(1)
    : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Atualize os detalhes do produto no sistema"
                  : "Preencha os dados para adicionar ao estoque"}
              </DialogDescription>
            </div>
            {isEditing && (
              <Badge variant="secondary" className="ml-auto">
                A editar
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {/* Section: Identificação */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <Tag className="h-3.5 w-3.5" />
                Identificação
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Laptop Dell XPS 15"
                        className="h-11 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Hash className="h-3 w-3" />
                        SKU
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: LPT-DEL-001"
                          className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Layers className="h-3 w-3" />
                        {isEditing ? "Quantidade Atual" : "Quantidade Inicial"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Preços */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <DollarSign className="h-3.5 w-3.5" />
                Preços & Margem
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Custo (MZN)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">MZN</span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="h-10 pl-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda (MZN)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">MZN</span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="h-10 pl-12 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Live margin indicator */}
              <div className="rounded-lg border border-dashed p-3 bg-muted/20 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Margem de lucro</span>
                <span className={`font-semibold ${margin > 0 ? "text-success" : margin < 0 ? "text-danger" : "text-muted-foreground"}`}>
                  {margin > 0 ? "+" : ""}{margin.toLocaleString("pt-MZ")} MZN ({marginPercent}%)
                </span>
              </div>
            </div>

            {/* Section: Stock & Classificação */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <Layers className="h-3.5 w-3.5" />
                Stock & Classificação
              </div>

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo (Alerta)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Receberá um alerta quando o estoque atingir este valor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3" />
                        Categoria
                      </FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10 bg-muted/30 border-border/60">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Truck className="h-3 w-3" />
                        Fornecedor (Opcional)
                      </FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10 bg-muted/30 border-border/60">
                            <SelectValue placeholder="Nenhum (Sem fornecedor)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum (Sem fornecedor)</SelectItem>
                          {suppliers.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Descrição */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5" />
                Detalhes Adicionais
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição detalhada do produto..."
                        className="resize-none min-h-[80px] bg-muted/30 border-border/60 focus:bg-background transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                className="min-w-[140px] bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : isEditing ? (
                  "Atualizar Produto"
                ) : (
                  "Criar Produto"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
