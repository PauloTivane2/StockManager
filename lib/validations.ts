import { z } from "zod";

// --- Authentication ---
export const loginSchema = z.object({
  email: z.string().email("Endereço de e-mail inválido"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
});

// --- Categories ---
export const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
  description: z.string().optional(),
});

// --- Suppliers ---
export const supplierSchema = z.object({
  name: z.string().min(1, "O nome do fornecedor é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// --- Customers ---
export const customerSchema = z.object({
  name: z.string().min(1, "O nome do cliente é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// --- Products ---
export const productSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório"),
  description: z.string().optional(),
  sku: z.string().min(1, "O SKU é obrigatório"),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, "O preço deve ser positivo"),
  costPrice: z.coerce.number().min(0, "O preço de custo deve ser positivo"),
  quantity: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
  image: z.string().optional(),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  supplierId: z.string().optional().or(z.literal("")),
});

// --- Stock Movements ---
export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Produto não selecionado"),
  type: z.enum(["ENTRY", "EXIT", "ADJUSTMENT", "TRANSFER"]),
  quantity: z.coerce.number().positive("A quantidade deve ser maior que zero"),
  reason: z.string().optional(),
  notes: z.string().optional(),
  userId: z.string().optional(), // Mudar para obrigatório quando houver auth real
});

// --- Orders ---
export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().positive(),
});

export const orderSchema = z.object({
  type: z.enum(["PURCHASE", "SALE"]),
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]).default("PENDING"),
  supplierId: z.string().optional(),
  customerId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "O pedido deve ter pelo menos um item"),
  userId: z.string().optional(), // Mudar para obrigatório quando houver auth real
});
