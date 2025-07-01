export interface Product {
  name: string;
  price: number;
}

export interface Sale {
  id?: number;
  products: Product[];
  total: number;
  payment_method: 'pix' | 'dinheiro' | 'crédito' | 'débito' | 'outro';
  created_at?: string;
  date?: string;
}