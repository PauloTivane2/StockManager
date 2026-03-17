import { CategoriesPage } from "@/components/categories/categories-page";
import { MainLayout } from "@/app/components/layout/main-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categorias - InventoryHub",
  description: "Gerencie as categorias de produtos do seu estoque",
};

export default function CategoriesRoute() {
  return (
    <MainLayout>
      <CategoriesPage />
    </MainLayout>
  );
}
