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
  id?: number;
  products: Product[];
  total: number;
  payment_method: 'pix' | 'dinheiro' | 'crédito' | 'débito' | 'outro';
  created_at?: string;
  date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private readonly API_URL = 'https://backend-orcin-alpha-63.vercel.app/api/sales';
  //private readonly API_URL = 'http://localhost:3001/api/sales';

  constructor(private http: HttpClient) {}

  registerSale(sale: Sale): Observable<{ message: string; sale: Sale }> {
    return this.http.post<{ message: string; sale: Sale }>(
      this.API_URL, 
      sale,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
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