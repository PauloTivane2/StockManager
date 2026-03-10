export * from "@prisma/client"

// Additional Custom Types or Overrides can go here:
export type DashboardStats = {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockAlerts: number;
  pendingOrdersCount: number;
};
