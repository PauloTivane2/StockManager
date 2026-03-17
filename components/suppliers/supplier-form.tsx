"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Truck, Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const supplierSchema = z.object({
  name: z.string().min(1, "O nome do fornecedor é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface DbSupplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface SupplierFormProps {
  supplier?: DbSupplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function SupplierForm({ supplier, open, onOpenChange, onSaved }: SupplierFormProps) {
  const isEditing = !!supplier;
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name,
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        address: supplier.address ?? "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [supplier, form]);

  const onSubmit = async (data: SupplierFormData) => {
    setSubmitting(true);
    try {
      const url = isEditing ? `/api/suppliers/${supplier.id}` : "/api/suppliers";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erro ao salvar fornecedor.");
        return;
      }

      toast.success(isEditing ? "Fornecedor atualizado com sucesso!" : "Fornecedor criado com sucesso!");
      onSaved();
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Erro ao salvar fornecedor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Atualize os detalhes de contato"
                  : "Cadastre um novo fornecedor no sistema"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome / Empresa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Comercial Lda."
                      className="bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    E-mail (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="contato@empresa.com"
                      className="bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    Telefone (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: +258 84 000 0000"
                      className="bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    Endereço (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Localização da empresa..."
                      className="bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 shadow-lg shadow-primary/25"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : isEditing ? (
                  "Atualizar"
                ) : (
                  "Criar Fornecedor"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
