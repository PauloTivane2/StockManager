// Categories enum
export enum Category {
  FOOD = "Alimentação",
  BEVERAGES = "Bebidas",
  CLEANING = "Limpeza",
  OTHER = "Outros",
}

// Movement types
export enum MovementType {
  ENTRY = "entry",
  EXIT = "exit",
}

// Product interface
export interface Product {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string; // kg, L, units, etc.
  unitPrice: number; // in Metical (MZN)
  minimumStock: number;
  lastUpdated: Date;
}

// Movement/Transaction interface
export interface Movement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  date: Date;
  reason?: string; // e.g., "restock", "sale", "damage", "adjustment"
  notes?: string;
}

// Dashboard metrics interface
export interface DashboardMetrics {
  totalProducts: number;
  lowStockItems: number;
  totalInventoryValue: number;
  movementsToday: number;
  recentMovements: Movement[];
}

// Inventory insight for reports
export interface InventoryInsight {
  title: string;
  description: string;
  type: "info" | "warning" | "success" | "error";
}
