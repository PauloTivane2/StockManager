export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateProductForm(data: {
  name?: string;
  category?: string;
  minQuantity?: string;
  price?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'Nome do produto é obrigatório' });
  }

  if (!data.category || data.category === '') {
    errors.push({ field: 'category', message: 'Categoria é obrigatória' });
  }

  if (!data.minQuantity || isNaN(Number(data.minQuantity))) {
    errors.push({ field: 'minQuantity', message: 'Quantidade mínima inválida' });
  } else if (Number(data.minQuantity) < 0) {
    errors.push({ field: 'minQuantity', message: 'Quantidade mínima deve ser positiva' });
  }

  if (!data.price || isNaN(Number(data.price))) {
    errors.push({ field: 'price', message: 'Preço inválido' });
  } else if (Number(data.price) < 0) {
    errors.push({ field: 'price', message: 'Preço deve ser positivo' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateMovementForm(data: {
  productId?: string;
  type?: string;
  quantity?: string;
  date?: string;
  time?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.productId || data.productId === '') {
    errors.push({ field: 'productId', message: 'Produto é obrigatório' });
  }

  if (!data.type || data.type === '') {
    errors.push({ field: 'type', message: 'Tipo de movimento é obrigatório' });
  }

  if (!data.quantity || isNaN(Number(data.quantity))) {
    errors.push({ field: 'quantity', message: 'Quantidade inválida' });
  } else if (Number(data.quantity) <= 0) {
    errors.push({ field: 'quantity', message: 'Quantidade deve ser maior que 0' });
  }

  if (!data.date || data.date === '') {
    errors.push({ field: 'date', message: 'Data é obrigatória' });
  }

  if (!data.time || data.time === '') {
    errors.push({ field: 'time', message: 'Hora é obrigatória' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getErrorMessage(field: string, errors: ValidationError[]): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}
