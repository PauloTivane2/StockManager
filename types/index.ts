// Local enums used by mock data, store, and UI components
export enum Category {
  FOOD = "Alimentação",
  BEVERAGES = "Bebidas",
  CLEANING = "Limpeza",
  OTHER = "Outros",
}

export enum MovementType {
  ENTRY = "ENTRY",
  EXIT = "EXIT",
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  unitPrice: number;
  minimumStock: number;
  lastUpdated: Date | string;
}

export interface Movement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  date: Date | string;
  reason?: string;
  notes?: string;
}

export type DashboardStats = {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockAlerts: number;
  pendingOrdersCount: number;
};
