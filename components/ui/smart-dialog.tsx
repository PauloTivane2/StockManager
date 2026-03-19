"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, Trash2 } from "lucide-react";
import { useDialogStore, DialogVariant } from "@/hooks/use-dialog";

// ─── Icon + colour map per variant ───────────────────────────────────────────

const variantConfig: Record<
  DialogVariant,
  {
    icon: React.ElementType;
    iconClass: string;
    iconBg: string;
    confirmClass: string;
  }
> = {
  info: {
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    confirmClass:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
  },
  confirm: {
    icon: Info,
    iconClass: "text-blue-500",
    iconBg: "bg-blue-500/10",
    confirmClass:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  },
  alert: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    iconBg: "bg-amber-500/10",
    confirmClass:
      "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500",
  },
  danger: {
    icon: Trash2,
    iconClass: "text-red-500",
    iconBg: "bg-red-500/10",
    confirmClass:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SmartDialog — global dialog renderer.
 * Mount this ONCE in your root layout, then use `useDialog()` from anywhere.
 */
export function SmartDialog() {
  const { open, options, isLoading, close, setLoading } = useDialogStore();

  if (!options) return null;

  const variant = options.variant ?? "info";
  const config = variantConfig[variant];
  const Icon = config.icon;
  const hasCancel = Boolean(options.cancelLabel);

  async function handleConfirm() {
    if (!options?.onConfirm) {
      close();
      return;
    }
    try {
      setLoading(true);
      await options.onConfirm();
    } finally {
      setLoading(false);
      close();
    }
  }

  function handleCancel() {
    options?.onCancel?.();
    close();
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          {/* Icon badge */}
          <div
            className={cn(
              "mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full sm:mx-0",
              config.iconBg
            )}
          >
            <Icon className={cn("h-7 w-7", config.iconClass)} strokeWidth={1.8} />
          </div>

          <AlertDialogTitle className="text-base font-semibold leading-snug sm:text-lg">
            {options.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed">
            {options.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2 gap-2 sm:gap-2">
          {hasCancel && (
            <AlertDialogCancel
              onClick={handleCancel}
              disabled={isLoading}
              className="min-w-[90px]"
            >
              {options.cancelLabel ?? "Cancelar"}
            </AlertDialogCancel>
          )}

          <AlertDialogAction
            id="dialog-confirm-btn"
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "min-w-[100px] transition-all focus-visible:ring-2 focus-visible:ring-offset-2",
              config.confirmClass
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                A processar...
              </span>
            ) : (
              (options.confirmLabel ?? "OK")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
