export const APP_NAME = "StockManager";
export const APP_DESCRIPTION = "Sistema de Gestão de Estoque Completo";

export const ITEMS_PER_PAGE = 10;
export const LOW_STOCK_THRESHOLD = 5;

// Constants for UI selects or logic
export const MOVEMENT_TYPES = [
  { value: "ENTRY", label: "Entrada" },
  { value: "EXIT", label: "Saída" },
  { value: "ADJUSTMENT", label: "Ajuste" },
  { value: "TRANSFER", label: "Transferência" },
];

export const ORDER_STATUS = [
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
];
