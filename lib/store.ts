import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, Movement, MovementType, Category } from "@/types";

interface InventoryStore {
  products: Product[];
  movements: Movement[];

  // Product actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  getProductsByCategory: (category: Category) => Product[];

  // Movement actions
  addMovement: (movement: Movement) => void;
  recordMovement: (
    productId: string,
    type: MovementType,
    quantity: number,
    reason?: string,
    notes?: string
  ) => void;
  getMovementsByProduct: (productId: string) => Movement[];
  getRecentMovements: (days?: number) => Movement[];

  // Query actions
  getLowStockItems: (threshold?: number) => Product[];
  getTotalInventoryValue: () => number;
  getProductCount: () => number;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      products: [],
      movements: [],

      // Product actions
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates, lastUpdated: new Date() } : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          movements: state.movements.filter((m) => m.productId !== id),
        })),

      getProduct: (id) => get().products.find((p) => p.id === id),

      getProductsByCategory: (category) =>
        get().products.filter((p) => p.category === category),

      // Movement actions
      addMovement: (movement) =>
        set((state) => ({
          movements: [...state.movements, movement],
        })),

      recordMovement: (productId, type, quantity, reason, notes) => {
        const product = get().getProduct(productId);
        if (!product) return;

        const newQuantity =
          type === MovementType.ENTRY
            ? product.quantity + quantity
            : product.quantity - quantity;

        // Update product quantity
        get().updateProduct(productId, { quantity: newQuantity });

        // Record movement
        const movement: Movement = {
          id: `mov_${Date.now()}_${Math.random()}`,
          productId,
          type,
          quantity,
          date: new Date(),
          reason,
          notes,
        };

        get().addMovement(movement);
      },

      getMovementsByProduct: (productId) =>
        get().movements.filter((m) => m.productId === productId),

      getRecentMovements: (days = 7) => {
        const now = new Date();
        const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        return get()
          .movements
          .filter((m) => {
            const movementDate = typeof m.date === 'string' ? new Date(m.date) : m.date;
            return movementDate >= pastDate;
          })
          .sort((a, b) => {
            const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
            const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
            return dateB.getTime() - dateA.getTime();
          });
      },

      // Query actions
      getLowStockItems: (threshold = 1) =>
        get().products.filter((p) => p.quantity <= threshold),

      getTotalInventoryValue: () =>
        get().products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0),

      getProductCount: () => get().products.length,
    }),
    {
      name: "inventory-store",
    }
  )
);
