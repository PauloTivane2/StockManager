"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useDialog } from "@/hooks/use-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Produtos",
    href: "/products",
    icon: Package,
  },
  {
    label: "Movimentações",
    href: "/movements",
    icon: ArrowRightLeft,
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Alertas",
    href: "/alerts",
    icon: Bell,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { confirmDialog } = useDialog();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background flex flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Kutenda</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-4">
        {/* User Profile */}
        <div className="flex items-center justify-between px-2 w-full">
          {status === "loading" ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 w-full cursor-pointer hover:bg-accent hover:text-accent-foreground p-2 rounded-md transition-colors">
                  <Avatar>
                    <AvatarImage src={session.user.image || undefined} alt="Avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.user.name?.substring(0, 2).toUpperCase() || <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden text-left flex-1">
                    <span className="text-sm font-medium truncate leading-none mb-1">{session.user.name}</span>
                    <span className="text-xs text-muted-foreground truncate leading-none">{session.user.email}</span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" alignOffset={-8}>
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    confirmDialog({
                      title: "Terminar Sessão",
                      description: "Tem certeza que deseja sair da sua conta? Será necessário fazer login novamente.",
                      confirmLabel: "Sim, sair",
                      onConfirm: () => signOut({ callbackUrl: "/login" }),
                    });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
