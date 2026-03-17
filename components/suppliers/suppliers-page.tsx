"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Truck, MoreVertical, Edit, Trash2 } from "lucide-react";
import { SupplierForm } from "./supplier-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface DbSupplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export function SuppliersPage({ embedded = false }: { embedded?: boolean }) {
  const [suppliers, setSuppliers] = useState<DbSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<DbSupplier | undefined>();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/suppliers?search=${encodeURIComponent(search)}&limit=50`);
      const json = await res.json();
      if (res.ok) {
        setSuppliers(json.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar fornecedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSuppliers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleAddNew = () => {
    setEditingSupplier(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (supplier: DbSupplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSupplierToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      const res = await fetch(`/api/suppliers/${supplierToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || "Erro ao deletar fornecedor.");
        return;
      }
      
      toast.success("Fornecedor deletado com sucesso!");
      fetchSuppliers();
    } catch (error) {
      toast.error("Erro ao deletar fornecedor.");
    } finally {
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      {!embedded && (
        <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
              <p className="text-muted-foreground mt-1 text-sm">Gerencie parceiros e fornecimento de produtos</p>
            </div>
          </div>
          <Button
            onClick={handleAddNew}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span>Todos os Fornecedores</span>
            <div className="flex items-center gap-3">
              <div className="relative w-52">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar fornecedor..."
                  className="pl-8 bg-muted/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddNew}
                size="sm"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 shadow-md shadow-primary/20"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Novo Fornecedor
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground">Nenhum fornecedor encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? "Tente buscar com outro termo." : "Cadastre o seu primeiro fornecedor."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Contato</th>
                    <th className="px-4 py-3 font-medium">Endereço</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {supplier.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="space-y-1">
                          {supplier.email && <div>{supplier.email}</div>}
                          {supplier.phone && <div>{supplier.phone}</div>}
                          {!supplier.email && !supplier.phone && "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                        {supplier.address || "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(supplier.id, supplier.name)}
                              className="text-danger focus:text-danger focus:bg-danger/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <SupplierForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        supplier={editingSupplier}
        onSaved={fetchSuppliers}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remover Fornecedor"
        description={`Tem certeza que deseja apagar "${supplierToDelete?.name}"? Esta ação ocultará o fornecedor do sistema.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
