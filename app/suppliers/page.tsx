import { SuppliersPage } from "@/components/suppliers/suppliers-page";
import { MainLayout } from "@/app/components/layout/main-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fornecedores - InventoryHub",
  description: "Gerencie os fornecedores do seu estoque",
};

export default function SuppliersRoute() {
  return (
    <MainLayout>
      <SuppliersPage />
    </MainLayout>
  );
}
