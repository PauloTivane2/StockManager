'use client';

import { ReactNode } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { Toaster } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
