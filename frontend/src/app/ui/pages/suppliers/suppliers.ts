import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalConfirmComponent } from '../../atoms/modal-confirm/modal-confirm';
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
    MatCardModule,
    ModalConfirmComponent
  ],
  templateUrl: './suppliers.html',
  styleUrls: ['./suppliers.scss']
})
export class Suppliers implements OnInit {
  displayedColumns: string[] = ['nome', 'documento', 'telefone', 'acoes'];
  fornecedores: any[] = [];

  sortField: 'nome' | 'documento' = 'nome';
  sortDirection: 'asc' | 'desc' = 'asc';

  supplierData: any = {
    id: undefined,
    nome: '',
    documento: '',
    telefone: ''
  };
  isEditMode = false;

  documentoMaxLength = 14; // 14 para CPF, 18 para CNPJ

  showDeleteModal: boolean = false;
  fornecedorToDelete: any = null;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFornecedores();
  }

  url = 'http://localhost:3001';
  url2 = 'https://backend-orcin-alpha-63.vercel.app';

  loadFornecedores() {
    this.http.get<any[]>(`${this.url2}/api/fornecedores`)
      .subscribe({
        next: (data) => {
          // Força nova referência para o array para atualização do Angular Material Table
          this.fornecedores = [...this.sortFornecedores(data)];
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
    if (value.length > 14) {
      value = value.substring(0, 14);
    }
    if (value.length <= 11) {
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d+)/, '$1.$2');
      }
    } else {
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
    const reloadAndReset = () => {
      this.loadFornecedores();
      this.resetForm(form);
    };
    if (this.isEditMode && this.supplierData.id) {
      // Editar fornecedor
      this.http.put(`${this.url2}/api/fornecedores/${this.supplierData.id}`, this.supplierData)
        .subscribe({
          next: () => {
            this.snackBar.open('Fornecedor editado com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            reloadAndReset();
          },
          error: (error) => {
            this.snackBar.open('Erro ao editar fornecedor: ' + error.message, 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      // Criar fornecedor
      this.http.post(`${this.url2}/api/fornecedores`, this.supplierData)
        .subscribe({
          next: () => {
            this.snackBar.open('Fornecedor cadastrado com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            reloadAndReset();
          },
          error: (error) => {
            this.snackBar.open('Erro ao cadastrar fornecedor: ' + error.message, 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  onEditFornecedor(fornecedor: any) {
    this.supplierData = { ...fornecedor };
    this.isEditMode = true;
  }

  onDeleteFornecedor(fornecedor: any) {
    this.fornecedorToDelete = fornecedor;
    this.showDeleteModal = true;
  }

  onDeleteModalClosed(confirmed: boolean) {
    if (confirmed && this.fornecedorToDelete) {
      this.http.delete(`${this.url2}/api/fornecedores/${this.fornecedorToDelete.id}`)
        .subscribe({
          next: () => {
            this.snackBar.open('Fornecedor excluído com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadFornecedores();
          },
          error: (error) => {
            this.snackBar.open('Erro ao excluir fornecedor: ' + error.message, 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
    this.showDeleteModal = false;
    this.fornecedorToDelete = null;
  }

  resetForm(form: any) {
    this.supplierData = {
      id: undefined,
      nome: '',
      documento: '',
      telefone: ''
    };
    this.isEditMode = false;
    if (form) form.resetForm();
  }
}
