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
import { Plus, Search, Tag, MoreVertical, Edit, Trash2 } from "lucide-react";
import { CategoryForm } from "./category-form";
import { notify } from "@/lib/notify";
import { useDialog } from "@/hooks/use-dialog";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";

interface DbCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  _count?: { products: number };
}

export function CategoriesPage({ embedded = false }: { embedded?: boolean }) {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | undefined>();
  const { dangerDialog } = useDialog();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/categories?search=${encodeURIComponent(search)}&limit=50`);
      const json = await res.json();
      if (res.ok) {
        setCategories(json.data || []);
      }
    } catch (error) {
      console.error(error);
      notify.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleAddNew = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (category: DbCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    dangerDialog({
      title: "Deletar Categoria",
      description: `Tem certeza que deseja deletar a categoria "${name}"? Isso só será possível se não houver produtos associados a ela.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
          const data = await res.json();
          
          if (!res.ok) {
            notify.error(data.error || "Erro ao deletar categoria.");
            return;
          }
          
          notify.success("Categoria deletada com sucesso!");
          fetchCategories();
        } catch {
          notify.error("Erro ao deletar categoria.");
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      {!embedded && (
        <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Tag className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
              <p className="text-muted-foreground mt-1 text-sm">Gerencie o agrupamento dos seus produtos</p>
            </div>
          </div>
          <Button
            onClick={handleAddNew}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span>Todas as Categorias</span>
            <div className="flex items-center gap-3">
              <div className="relative w-52">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar categoria..."
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
                Nova Categoria
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton columns={4} rows={5} />
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground">Nenhuma categoria encontrada</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? "Tente buscar com outro termo." : "Crie a sua primeira categoria para organizar produtos."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Produtos</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {category.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                        {category.description || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {category._count?.products || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(category.id, category.name)}
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

      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
        onSaved={fetchCategories}
      />
    </div>
  );
}
