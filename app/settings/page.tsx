"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notify } from "@/lib/notify";
import { useSession } from "next-auth/react";
import { useDialog } from "@/hooks/use-dialog";
import {
  Shield,
  Server,
  Database,
  Download,
  Trash2,
  User,
  Mail,
  KeyRound,
  Loader2,
  CheckCircle2,
  Info,
  Globe,
  Palette,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Settings() {
  const { data: session, update: updateSession } = useSession();
  const { dangerDialog } = useDialog();

  // Profile edit state
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  const handleStartEditName = () => {
    setNewName(session?.user?.name || "");
    setEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error || "Erro ao atualizar nome.");
        return;
      }
      await updateSession({ name: data.name });
      notify.success("Nome atualizado com sucesso!");
      setEditingName(false);
    } catch {
      notify.error("Erro ao atualizar nome.");
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      notify.error("Preencha todos os campos de senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      notify.error("A nova senha e a confirmação não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      notify.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error || "Erro ao alterar senha.");
        return;
      }
      notify.success("Senha alterada com sucesso!");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      notify.error("Erro ao alterar senha.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) {
        notify.error("Erro ao exportar dados.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kutenda-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify.success("Dados exportados com sucesso!");
    } catch {
      notify.error("Erro ao exportar dados.");
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    dangerDialog({
      title: "Limpar Todos os Dados",
      description: "Tem certeza que deseja apagar todos os dados do sistema? Esta ação é irreversível e todos os produtos, movimentações e relatórios serão perdidos permanentemente.",
      onConfirm: async () => {
        notify.info("Cativo", "Funcionalidade de limpeza de dados desativada por segurança.");
      }
    });
  };

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrador",
    MANAGER: "Gestor",
    USER: "Utilizador",
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie o seu perfil e as configurações do sistema
        </p>
      </div>

      {/* ── Profile ── */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-4 bg-primary/5 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Perfil do Utilizador</CardTitle>
              <CardDescription>Informações da sua conta</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              Nome
            </Label>
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-muted/30"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                />
                <Button onClick={handleSaveName} disabled={savingName} size="sm">
                  {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingName(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <Input value={session?.user?.name || "—"} disabled className="bg-muted/30" />
                <Button variant="outline" size="sm" onClick={handleStartEditName}>
                  Editar
                </Button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              Email
            </Label>
            <Input value={session?.user?.email || "—"} disabled className="bg-muted/30" />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="h-3 w-3" />
              Cargo / Função
            </Label>
            <div>
              <Badge variant="secondary">
                {roleLabel[(session?.user as any)?.role] || (session?.user as any)?.role || "N/A"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Password */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <KeyRound className="h-3 w-3" />
                Senha
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
              >
                {showPasswordForm ? "Cancelar" : "Alterar Senha"}
              </Button>
            </div>

            {showPasswordForm && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/50">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="bg-background"
                  />
                </div>

                <Button
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90"
                >
                  {savingPassword ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar...</>
                  ) : (
                    "Confirmar Nova Senha"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── System Info ── */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-4 bg-success/5 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success to-accent flex items-center justify-center shadow-lg shadow-success/25">
              <Server className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Informações do Sistema</CardTitle>
              <CardDescription>Detalhes técnicos da plataforma</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Info, label: "Versão", value: "1.0.0" },
              { icon: Globe, label: "Ambiente", value: "Produção" },
              { icon: Database, label: "Base de Dados", value: "PostgreSQL" },
              { icon: Palette, label: "Framework", value: "Next.js 15" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
              >
                <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border/60">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-5" />

          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
            <p className="text-sm text-success">
              Sistema operacional — Todos os serviços a funcionar normalmente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Data Management ── */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="pb-4 bg-warning/5 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center shadow-lg shadow-warning/25">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Gestão de Dados</CardTitle>
              <CardDescription>Exportar ou limpar os dados do sistema</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleExport}
            disabled={exporting}
          >
            <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
              {exporting ? (
                <Loader2 className="h-4 w-4 text-info animate-spin" />
              ) : (
                <Download className="h-4 w-4 text-info" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">
                {exporting ? "A exportar..." : "Exportar Dados (CSV)"}
              </p>
              <p className="text-xs text-muted-foreground">
                Produtos, movimentos, categorias e fornecedores
              </p>
            </div>
          </Button>

          <Separator />

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12 border-danger/30 hover:bg-danger/10"
            onClick={handleClearData}
          >
            <div className="h-8 w-8 rounded-lg bg-danger/10 flex items-center justify-center">
              <Trash2 className="h-4 w-4 text-danger" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-danger">Limpar Todos os Dados</p>
              <p className="text-xs text-muted-foreground">
                Remove todos os produtos, movimentos e registos
              </p>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
