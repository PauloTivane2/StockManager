"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { ProductsTable } from "./products-table";
import { CategoriesPage } from "@/components/categories/categories-page";
import { SuppliersPage } from "@/components/suppliers/suppliers-page";
import { Plus, Package, Tag, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  price: string | number;
  costPrice: string | number;
  quantity: number;
  minStock: number;
  image: string | null;
  status: string;
  categoryId: string;
  supplierId: string | null;
  category: { id: string; name: string };
  supplier: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

type Tab = "products" | "categories" | "suppliers";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "products", label: "Produtos", icon: Package },
  { id: "categories", label: "Categorias", icon: Tag },
  { id: "suppliers", label: "Fornecedores", icon: Truck },
];

export function ProductsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | undefined>();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?limit=100");
      const json = await res.json();
      setProducts(json.data ?? []);
    } catch {
      toast.error("Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: DbProduct) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Erro ao remover produto.");
        return;
      }
      toast.success("Produto removido com sucesso!");
      fetchProducts();
    } catch {
      toast.error("Erro ao remover produto.");
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProduct(undefined);
  };

  const handleSaved = () => {
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Gerencie produtos, categorias e fornecedores
            </p>
          </div>
        </div>
        {activeTab === "products" && (
          <Button
            onClick={handleAddNew}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-0 -mb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "products" && (
          <ProductsTable
            products={products}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === "categories" && <CategoriesPage embedded />}

        {activeTab === "suppliers" && <SuppliersPage embedded />}
      </div>

      {/* Product Form Dialog */}
      <ProductForm
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSaved={handleSaved}
      />
    </div>
  );
}
