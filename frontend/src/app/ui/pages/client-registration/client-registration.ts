import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-client-registration',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonToggleModule,
  ],
  templateUrl: './client-registration.html',
  styleUrls: ['./client-registration.scss']
})
export class ClientRegistration implements OnInit {
  displayedColumns: string[] = ['nome', 'telefone', 'data_nascimento'];
  clientes: any[] = [];

  // Opções de ordenação
  sortField: 'nome' | 'data_nascimento' = 'nome';
  sortDirection: 'asc' | 'desc' = 'asc';

  clientData = {
    nome: '',
    telefone: '',
    data_nascimento: ''
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    //this.http.get<any[]>('http://localhost:3001/api/clientes')
    this.http.get<any[]>('https://backend-orcin-alpha-63.vercel.app/api/clientes')    
      .subscribe({
        next: (data) => {
          this.clientes = this.sortClientes(data);
        },
        error: (error) => {
          this.snackBar.open('Erro ao carregar clientes: ' + error.message, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  // Função para ordenar clientes
  sortClientes(clientes: any[]): any[] {
    const field = this.sortField;
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    return clientes.slice().sort((a, b) => {
      let valA = a[field] || '';
      let valB = b[field] || '';
      if (field === 'data_nascimento') {
        valA = valA ? new Date(valA) : new Date(0);
        valB = valB ? new Date(valB) : new Date(0);
        return ((valA as Date).getTime() - (valB as Date).getTime()) * direction;
      }
      return valA.localeCompare(valB) * direction;
    });
  }

  // Alternar campo de ordenação
  setSortField(field: 'nome' | 'data_nascimento') {
    if (this.sortField === field) {
      this.toggleSortDirection();
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.clientes = this.sortClientes(this.clientes);
  }

  // Alternar direção
  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.clientes = this.sortClientes(this.clientes);
  }
  
  formatPhone() {
    let value = this.clientData.telefone.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 0) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
    }
    if (value.length > 9) {
      value = value.replace(/(\d{5})(\d{4})$/, '$1-$2');
    } else if (value.length > 5) {
      value = value.replace(/(\d{4})(\d{0,4})$/, '$1-$2');
    }
    this.clientData.telefone = value;
  }

  onSubmit(form: any) {
    this.http.post('http://localhost:3001/api/clientes', this.clientData)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Cliente cadastrado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.resetForm(form);
          this.loadClientes(); // Atualiza a tabela depois de cadastrar
        },
        error: (error) => {
          this.snackBar.open('Erro ao cadastrar cliente: ' + error.message, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  resetForm(form: any) {
    this.clientData = {
      nome: '',
      telefone: '',
      data_nascimento: ''
    };
    if (form) {
      form.resetForm();
    }
  }
}