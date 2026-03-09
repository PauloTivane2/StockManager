"use client";

import { useEffect } from "react";
import { initializeStore } from "@/lib/init-store";
import { useInventoryStore } from "@/lib/store";

export function InitializeStore() {
  useEffect(() => {
    // Clean up any duplicate data from previous sessions
    const store = useInventoryStore.getState();

    const uniqueProducts = store.products.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
    );

    const uniqueMovements = store.movements.filter(
      (movement, index, self) =>
        index === self.findIndex((m) => m.id === movement.id)
    );

    if (
      uniqueProducts.length !== store.products.length ||
      uniqueMovements.length !== store.movements.length
    ) {
      useInventoryStore.setState({
        products: uniqueProducts,
        movements: uniqueMovements,
      });
    }

    initializeStore();
  }, []);

  return null;
}

