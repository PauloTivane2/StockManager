"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as configurações do seu sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sobre o InventoryHub</CardTitle>
          <CardDescription>Informações da plataforma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Versão</p>
            <p className="text-foreground">1.0.0</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
            <p className="text-foreground">
              {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Aplicação</CardTitle>
          <CardDescription>Gerencie seus dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Exportar Dados
          </Button>
          <Button variant="outline" className="w-full">
            Importar Dados
          </Button>
          <Button variant="destructive" className="w-full">
            Limpar Todos os Dados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
