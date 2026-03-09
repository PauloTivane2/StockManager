export enum Category {
  ALIMENTACAO = 'Alimentação',
  BEBIDAS = 'Bebidas',
  LIMPEZA = 'Limpeza',
  OUTROS = 'Outros',
}

export enum MovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  minQuantity: number;
  price: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Movement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  date: string | Date;
  time: string;
  reason?: string;
  createdAt: string | Date;
}

export interface Insight {
  id: string;
  type: 'lowStock' | 'outOfStock' | 'highValue' | 'overstock';
  productId: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  acknowledged: boolean;
  createdAt: string | Date;
}

export interface InventoryState {
  products: Product[];
  movements: Movement[];
  insights: Insight[];
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  
  // Movement actions
  addMovement: (movement: Omit<Movement, 'id' | 'createdAt'>) => void;
  deleteMovement: (id: string) => void;
  getRecentMovements: (days?: number) => Movement[];
  
  // Insight actions
  addInsight: (insight: Omit<Insight, 'id' | 'createdAt'>) => void;
  updateInsight: (id: string, insight: Partial<Insight>) => void;
  deleteInsight: (id: string) => void;
  acknowledgeInsight: (id: string) => void;
  getUnacknowledgedInsights: () => Insight[];
}
