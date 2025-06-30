import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importe o operador map

export interface Product {
  name: string;
  price: number;
  quantity?: number; // Adicione se necessário
}

export interface Sale {
  id?: number; // Adicione se retornado pelo backend
  products: Product[];
  total: number;
  date?: string; // Mantenha para compatibilidade
  created_at?: string; // Adicione para o Supabase
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private readonly API_URL = 'https://backend-orcin-alpha-63.vercel.app/api/sales';

  constructor(private http: HttpClient) {}

  registerSale(sale: Sale): Observable<Sale> {
    return this.http.post<Sale>(this.API_URL, sale);
  }

  getSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(this.API_URL).pipe(
      map((sales: Sale[]) => sales.map((sale: Sale) => ({
        ...sale,
        date: sale.created_at || sale.date || new Date().toISOString() // Fallback
      })))
    );
  }
}