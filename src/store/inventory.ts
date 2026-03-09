import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, MovementType, Product, Movement, Insight, InventoryState } from '@/types';
import { generateId, isWithinLastNDays } from '@/lib/utils';
import { MOCK_PRODUCTS, MOCK_MOVEMENTS } from './mock-data';

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      products: [],
      movements: [],
      insights: [],

      // Product actions
      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      getProduct: (id) => {
        return get().products.find((p) => p.id === id);
      },

      // Movement actions
      addMovement: (movement) => {
        const product = get().getProduct(movement.productId);
        if (!product) return;

        const newMovement: Movement = {
          ...movement,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        // Update product quantity
        const newQuantity =
          movement.type === MovementType.ENTRY
            ? product.quantity + movement.quantity
            : Math.max(0, product.quantity - movement.quantity);

        get().updateProduct(movement.productId, { quantity: newQuantity });
        set((state) => ({ movements: [...state.movements, newMovement] }));

        // Generate insights
        const updatedProduct = { ...product, quantity: newQuantity };
        if (updatedProduct.quantity === 0) {
          get().addInsight({
            type: 'outOfStock',
            productId: movement.productId,
            message: `${product.name} está fora de estoque`,
            severity: 'danger',
            acknowledged: false,
          });
        } else if (updatedProduct.quantity <= updatedProduct.minQuantity) {
          get().addInsight({
            type: 'lowStock',
            productId: movement.productId,
            message: `${product.name} tem estoque baixo`,
            severity: 'warning',
            acknowledged: false,
          });
        }
      },

      deleteMovement: (id) => {
        set((state) => ({
          movements: state.movements.filter((m) => m.id !== id),
        }));
      },

      getRecentMovements: (days = 7) => {
        return get()
          .movements.filter((m) => isWithinLastNDays(m.date, days))
          .sort((a, b) => {
            const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
            const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
            return dateB.getTime() - dateA.getTime();
          });
      },

      // Insight actions
      addInsight: (insight) => {
        const newInsight: Insight = {
          ...insight,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ insights: [...state.insights, newInsight] }));
      },

      updateInsight: (id, updates) => {
        set((state) => ({
          insights: state.insights.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        }));
      },

      deleteInsight: (id) => {
        set((state) => ({
          insights: state.insights.filter((i) => i.id !== id),
        }));
      },

      acknowledgeInsight: (id) => {
        get().updateInsight(id, { acknowledged: true });
      },

      getUnacknowledgedInsights: () => {
        return get().insights.filter((i) => !i.acknowledged);
      },
    }),
    {
      name: 'inventory-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state && (!state.products || state.products.length === 0)) {
          state.products = MOCK_PRODUCTS;
          state.movements = MOCK_MOVEMENTS;
        }
      },
    }
  )
);
