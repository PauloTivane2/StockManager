"use client";

import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DialogVariant = "info" | "confirm" | "alert" | "danger";

export interface DialogOptions {
  /** Short, clear title — e.g. "Excluir Produto?" */
  title: string;
  /** Descriptive, friendly message */
  description: string;
  /** Variant controls icon + confirm button colour */
  variant?: DialogVariant;
  /** Label for the primary action button (default: "OK") */
  confirmLabel?: string;
  /** Label for the cancel button — omit for single-button info dialogs */
  cancelLabel?: string;
  /** Called when the user clicks the confirm / OK button */
  onConfirm?: () => void | Promise<void>;
  /** Called when the user clicks cancel or closes the dialog */
  onCancel?: () => void;
}

interface DialogState {
  open: boolean;
  options: DialogOptions | null;
  isLoading: boolean;
  show: (options: DialogOptions) => void;
  close: () => void;
  setLoading: (v: boolean) => void;
}

// ─── Global Store (Zustand) ──────────────────────────────────────────────────

export const useDialogStore = create<DialogState>((set) => ({
  open: false,
  options: null,
  isLoading: false,
  show: (options) => set({ open: true, options, isLoading: false }),
  close: () => set({ open: false, options: null, isLoading: false }),
  setLoading: (v) => set({ isLoading: v }),
}));

// ─── Public hook ─────────────────────────────────────────────────────────────

/**
 * useDialog — trigger smart dialogs from any component or service.
 *
 * @example
 * const { infoDialog, confirmDialog, dangerDialog, alertDialog } = useDialog();
 *
 * // Simple success info
 * infoDialog("Sucesso!", "Produto criado com sucesso.");
 *
 * // Confirm with async action
 * confirmDialog("Guardar alterações?", "As alterações serão guardadas.", () => save());
 *
 * // Danger with full options object
 * dangerDialog({
 *   title: "Excluir Produto?",
 *   description: `Tem certeza que deseja excluir "${product.name}"?`,
 *   onConfirm: () => productService.delete(product.id),
 * });
 *
 * // Error alert single button
 * alertDialog("Sessão expirada", "A sua sessão expirou. Por favor, faça login novamente.");
 */
export function useDialog() {
  const { show } = useDialogStore();

  /** ✔ Info dialog — single OK button, green icon */
  function infoDialog(title: string, description: string, onConfirm?: () => void) {
    show({ title, description, variant: "info", confirmLabel: "OK", onConfirm });
  }

  /**
   * ℹ Confirmation dialog — Cancel + Confirm (blue).
   * Accepts either (title, description, onConfirm) or a full DialogOptions object.
   */
  function confirmDialog(
    titleOrOptions: string | DialogOptions,
    description?: string,
    onConfirm?: () => void | Promise<void>
  ) {
    if (typeof titleOrOptions === "string") {
      show({
        title: titleOrOptions,
        description: description ?? "",
        variant: "confirm",
        confirmLabel: "Confirmar",
        cancelLabel: "Cancelar",
        onConfirm,
      });
    } else {
      show({
        variant: "confirm",
        confirmLabel: "Confirmar",
        cancelLabel: "Cancelar",
        ...titleOrOptions,
      });
    }
  }

  /**
   * 🗑 Danger dialog — Cancel + red Excluir button.
   * Accepts either (title, description, onConfirm) or a full DialogOptions object.
   */
  function dangerDialog(
    titleOrOptions: string | DialogOptions,
    description?: string,
    onConfirm?: () => void | Promise<void>
  ) {
    if (typeof titleOrOptions === "string") {
      show({
        title: titleOrOptions,
        description: description ?? "",
        variant: "danger",
        confirmLabel: "Sim, excluir",
        cancelLabel: "Cancelar",
        onConfirm,
      });
    } else {
      show({
        variant: "danger",
        confirmLabel: "Sim, excluir",
        cancelLabel: "Cancelar",
        ...titleOrOptions,
      });
    }
  }

  /** ⚠ Alert dialog — single OK button, amber icon, for warnings/errors */
  function alertDialog(title: string, description: string, onConfirm?: () => void) {
    show({
      title,
      description,
      variant: "alert",
      confirmLabel: "Entendido",
      onConfirm,
    });
  }

  return { infoDialog, confirmDialog, dangerDialog, alertDialog };
}
