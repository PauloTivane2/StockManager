import { useInventoryStore } from "./store";
import { MOCK_PRODUCTS, MOCK_MOVEMENTS } from "./mock-data";

let initialized = false;

export function initializeStore() {
  if (initialized) return;
  initialized = true;

  const store = useInventoryStore.getState();

  // Only seed mock data if the store is empty (no persisted data)
  if (store.products.length > 0 || store.movements.length > 0) {
    return;
  }

  // Add mock products
  MOCK_PRODUCTS.forEach((product) => {
    store.addProduct(product);
  });

  // Add mock movements
  MOCK_MOVEMENTS.forEach((movement) => {
    store.addMovement(movement);
  });
}
