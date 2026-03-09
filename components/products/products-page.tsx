"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useInventoryStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { ProductsTable } from "./products-table";
import { Plus } from "lucide-react";

export function ProductsPage() {
  const { products, deleteProduct } = useInventoryStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
  };

  const handleAddNew = () => {
    setSelectedProduct(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProduct(undefined);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os produtos do seu estoque
          </p>
        </div>
        <Button onClick={handleAddNew} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <ProductsTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProductForm
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}
