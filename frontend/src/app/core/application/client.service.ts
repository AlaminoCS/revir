import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id?: string;
  nome: string;
  telefone: string;
  data_nascimento?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly API_URL = 'https://backend-orcin-alpha-63.vercel.app/api/clientes';
  // private readonly API_URL = 'http://localhost:3001/api/clientes';

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.API_URL);
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/${id}`);
  }

  createClient(client: Client): Observable<{ message: string; cliente: Client }> {
    return this.http.post<{ message: string; cliente: Client }>(
      this.API_URL,
      client,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  updateClient(id: string, client: Client): Observable<{ message: string; cliente: Client }> {
    return this.http.put<{ message: string; cliente: Client }>(
      `${this.API_URL}/${id}`,
      client,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  deleteClient(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }
}
