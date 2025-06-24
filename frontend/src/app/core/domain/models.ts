export interface Product {
  name: string;
  price: number;
}

export interface Sale {
  id: number;
  products: Product[];
  total: number;
  date: string;
}