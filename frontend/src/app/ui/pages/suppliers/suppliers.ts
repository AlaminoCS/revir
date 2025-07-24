import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-suppliers',
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
    MatIconModule,
    RouterModule,
    MatCardModule
  ],
  templateUrl: './suppliers.html',
  styleUrls: ['./suppliers.scss']
})
export class Suppliers implements OnInit {
  displayedColumns: string[] = ['nome', 'documento', 'telefone'];
  fornecedores: any[] = [];

  sortField: 'nome' | 'documento' = 'nome';
  sortDirection: 'asc' | 'desc' = 'asc';


  supplierData = {
    nome: '',
    documento: '',
    telefone: ''
  };

  documentoMaxLength = 14; // 14 para CPF, 18 para CNPJ

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFornecedores();
  }

  url = 'http://localhost:3001';
  url2 = 'https://backend-orcin-alpha-63.vercel.app/';

  loadFornecedores() {
    this.http.get<any[]>(`${this.url2}/api/fornecedores`)
      .subscribe({
        next: (data) => {
          this.fornecedores = this.sortFornecedores(data);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.snackBar.open('Erro ao carregar fornecedores: ' + error.message, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  sortFornecedores(fornecedores: any[]): any[] {
    const field = this.sortField;
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    return fornecedores.slice().sort((a, b) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      return valA.localeCompare(valB) * direction;
    });
  }

  setSortField(field: 'nome' | 'documento') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.fornecedores = this.sortFornecedores(this.fornecedores);
  }


  formatDocumento(): void {
    let value = this.supplierData.documento.replace(/\D/g, '');

    // Limita só no código, não no input
    if (value.length > 14) {
      value = value.substring(0, 14);
    }

    // Aplica a máscara conforme o tamanho
    if (value.length <= 11) {
      // CPF
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d+)/, '$1.$2');
      }
    } else {
      // CNPJ
      if (value.length > 12) {
        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
      } else if (value.length > 8) {
        value = value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
      } else if (value.length > 5) {
        value = value.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d+)/, '$1.$2');
      }
    }

    this.supplierData.documento = value;
  }


  formatPhone() {
    let value = this.supplierData.telefone.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 0) value = value.replace(/(\d{2})(\d)/, '($1) $2');
    if (value.length > 9) value = value.replace(/(\d{5})(\d{4})$/, '$1-$2');
    else if (value.length > 5) value = value.replace(/(\d{4})(\d{0,4})$/, '$1-$2');
    this.supplierData.telefone = value;
  }

  onSubmit(form: any) {
    this.http.post(`${this.url2}/api/fornecedores`, this.supplierData)
      .subscribe({
        next: () => {
          this.snackBar.open('Fornecedor cadastrado com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.resetForm(form);
          this.loadFornecedores();
        },
        error: (error) => {
          this.snackBar.open('Erro ao cadastrar fornecedor: ' + error.message, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  resetForm(form: any) {
    this.supplierData = {
      nome: '',
      documento: '',
      telefone: ''
    };
    if (form) form.resetForm();
  }
}
