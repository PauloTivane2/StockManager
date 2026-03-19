/**
 * notify — thin, strongly-typed wrapper over Sonner.
 *
 * Usage:
 *   import { notify } from "@/lib/notify";
 *
 *   notify.success("Produto criado com sucesso!");
 *   notify.error("Não foi possível excluir o produto.");
 *   notify.loading("A guardar alterações...");
 *   notify.promise(productService.create(data), {
 *     loading: "A criar produto...",
 *     success: "Produto criado com sucesso!",
 *     error: "Erro ao criar produto.",
 *   });
 */

import { toast } from "sonner";

export const notify = {
  /** ✔ Green — operation succeeded */
  success: (message: string, description?: string) =>
    toast.success(message, { description }),

  /** ✖ Red — operation failed */
  error: (message: string, description?: string) =>
    toast.error(message, { description }),

  /** ⚠ Amber — non-critical warning */
  warning: (message: string, description?: string) =>
    toast.warning(message, { description }),

  /** ℹ Blue — neutral information */
  info: (message: string, description?: string) =>
    toast.info(message, { description }),

  /** ⏳ Neutral with spinner */
  loading: (message: string) => toast.loading(message),

  /** Promise-aware toast — auto-updates on resolve / reject */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) => toast.promise(promise, messages),

  /** Dismiss a specific toast by id */
  dismiss: (id?: string | number) => toast.dismiss(id),
};
