import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  name: string;
  price: number;
}

export interface Sale {
  products: Product[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private readonly API_URL = 'https://revir-backend-737175867232.us-central1.run.app/api/sales'; 

  constructor(private http: HttpClient) {}

  registerSale(sale: Sale): Observable<any> {
    return this.http.post(this.API_URL, sale);
  }

  getSales(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }
}