"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MovementType } from "@/types";
import { useInventoryStore } from "@/lib/store";
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

const movementSchema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  type: z.enum([MovementType.ENTRY, MovementType.EXIT]),
  quantity: z.coerce
    .number()
    .min(1, "Quantidade deve ser maior que 0"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovementForm({ open, onOpenChange }: MovementFormProps) {
  const { recordMovement, products } = useInventoryStore();

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productId: "",
      type: MovementType.EXIT,
      quantity: 1,
      reason: "",
      notes: "",
    },
  });

  const onSubmit = (data: MovementFormData) => {
    const product = products.find((p) => p.id === data.productId);
    if (!product) {
      toast.error("Produto não encontrado");
      return;
    }

    // Check if exit quantity exceeds available stock
    if (data.type === MovementType.EXIT && data.quantity > product.quantity) {
      toast.error(
        `Estoque insuficiente. Disponível: ${product.quantity} ${product.unit}`
      );
      return;
    }

    recordMovement(
      data.productId,
      data.type,
      data.quantity,
      data.reason,
      data.notes
    );

    const movementLabel =
      data.type === MovementType.ENTRY ? "entrada" : "saída";
    toast.success(`${data.quantity} unidades registradas como ${movementLabel}`);

    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Movimentação</DialogTitle>
          <DialogDescription>
            Registre uma entrada ou saída de produto do seu estoque
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.quantity} {product.unit})
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={MovementType.ENTRY}>
                        Entrada (Reposição)
                      </SelectItem>
                      <SelectItem value={MovementType.EXIT}>
                        Saída (Venda/Uso)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo (Opcional)</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um motivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Venda">Venda</SelectItem>
                      <SelectItem value="Reposição">Reposição</SelectItem>
                      <SelectItem value="Dano">Dano</SelectItem>
                      <SelectItem value="Ajuste">Ajuste</SelectItem>
                      <SelectItem value="Devolução">Devolução</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione informações adicionais..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Máximo 200 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Registrar Movimentação</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
