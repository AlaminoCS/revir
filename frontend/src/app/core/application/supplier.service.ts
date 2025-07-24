import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface Supplier {
  id?: string
  name: string
  cnpj: string
  // Adicione outros campos conforme necessário, ex: endereço, telefone, etc.
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private readonly API_URL = 'https://backend-orcin-alpha-63.vercel.app/api/fornecedores'
  // private readonly API_URL = 'http://localhost:3001/api/fornecedores'

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.API_URL)
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.API_URL}/${id}`)
  }

  createSupplier(supplier: Supplier): Observable<{ message: string; supplier: Supplier }> {
    return this.http.post<{ message: string; supplier: Supplier }>(
      this.API_URL,
      supplier,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  updateSupplier(id: string, supplier: Supplier): Observable<{ message: string; supplier: Supplier }> {
    return this.http.put<{ message: string; supplier: Supplier }>(
      `${this.API_URL}/${id}`,
      supplier,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  deleteSupplier(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`)
  }
}
