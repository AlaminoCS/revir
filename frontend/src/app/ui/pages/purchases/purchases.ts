
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
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-purchases',
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
    MatSelectModule,
    RouterModule,
    MatCardModule,
    ModalConfirmComponent
  ],
  templateUrl: './purchases.html',
  styleUrls: ['./purchases.scss']
})
export class PurchasesComponent implements OnInit {
  onValorFocus() {
    this.purchaseData.valor = '';
  }
  displayedColumns: string[] = ['fornecedor', 'tipo', 'quantidade', 'valor', 'acoes'];
  compras: any[] = [];

  fornecedores: any[] = [];
  filteredFornecedores: any[] = [];
  fornecedorFilter: string = '';

  sortField: 'fornecedor' | 'tipo' = 'fornecedor';
  sortDirection: 'asc' | 'desc' = 'asc';

  purchaseData: any = {
    id: undefined,
    fornecedor_id: '', // UUID do fornecedor
    tipo: 'venda',
    quantidade: 1,
    valor: 0
  };
  isEditMode = false;

  showDeleteModal: boolean = false;
  compraToDelete: any = null;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFornecedores();
  }
  loadFornecedores() {
    this.http.get<any[]>(`${this.url2}/api/fornecedores`)
      .subscribe({
        next: (data) => {
          this.fornecedores = data;
          this.filteredFornecedores = data;
          this.loadCompras(); // Só carrega compras depois de fornecedores
        },
        error: (error) => {
          this.snackBar.open('Erro ao carregar fornecedores: ' + error.message, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  filterFornecedores() {
    const filterValue = this.fornecedorFilter.toLowerCase();
    this.filteredFornecedores = this.fornecedores.filter(f => f.nome.toLowerCase().includes(filterValue));
  }

  url = 'http://localhost:3001';
  url2 = 'https://backend-orcin-alpha-63.vercel.app';

  loadCompras() {
    this.http.get<any[]>(`${this.url2}/api/purchases`)
      .subscribe({
        next: (data) => {
          // Adiciona o nome do fornecedor a cada compra
          this.compras = this.sortCompras(data.map(compra => ({
            ...compra,
            fornecedor: this.getFornecedorNome(compra.fornecedor_id)
          })));
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.snackBar.open('Erro ao carregar compras: ' + error.message, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  getFornecedorNome(fornecedor_id: string): string {
    const fornecedor = this.fornecedores.find(f => f.id === fornecedor_id);
    return fornecedor ? fornecedor.nome : 'Fornecedor não encontrado';
  }

  sortCompras(compras: any[]): any[] {
    const field = this.sortField;
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    return compras.slice().sort((a, b) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      return valA.localeCompare(valB) * direction;
    });
  }

  setSortField(field: 'fornecedor' | 'tipo') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.compras = this.sortCompras(this.compras);
  }

  onSubmit(form: any) {
    const reloadAndReset = () => {
      this.loadCompras();
      this.resetForm(form);
    };
    // Converte o valor para número antes de enviar
    let valorStr = this.purchaseData.valor;
    let valorNum = 0;
    if (typeof valorStr === 'string') {
      // Remove pontos de milhar e troca vírgula por ponto
      valorNum = parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
    } else {
      valorNum = valorStr;
    }
    const payload = {
      fornecedor_id: this.purchaseData.fornecedor_id,
      tipo: this.purchaseData.tipo,
      quantidade: this.purchaseData.quantidade,
      valor: valorNum
    };
    if (this.isEditMode && this.purchaseData.id) {
      // Editar compra
      this.http.put(`${this.url2}/api/purchases/${this.purchaseData.id}`, payload)
        .subscribe({
          next: () => {
            this.snackBar.open('Compra editada com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            reloadAndReset();
          },
          error: (error) => {
            this.snackBar.open('Erro ao editar compra: ' + error.message, 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    } else {
      // Criar compra
      this.http.post(`${this.url2}/api/purchases`, payload)
        .subscribe({
          next: () => {
            this.snackBar.open('Compra cadastrada com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            reloadAndReset();
          },
          error: (error) => {
            this.snackBar.open('Erro ao cadastrar compra: ' + error.message, 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  onEditCompra(compra: any) {
    // Ajusta para garantir que o fornecedor_id seja preenchido
    this.purchaseData = {
      id: compra.id,
      fornecedor_id: compra.fornecedor_id || '',
      tipo: compra.tipo,
      quantidade: compra.quantidade,
      valor: compra.valor
    };
    this.isEditMode = true;
  }

  onDeleteCompra(compra: any) {
    this.compraToDelete = compra;
    this.showDeleteModal = true;
  }

  onDeleteModalClosed(confirmed: boolean) {
    if (confirmed && this.compraToDelete) {
      this.http.delete(`${this.url2}/api/purchases/${this.compraToDelete.id}`)
        .subscribe({
          next: () => {
            this.snackBar.open('Compra excluída com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadCompras();
          },
          error: (error) => {
            this.snackBar.open('Erro ao excluir compra: ' + error.message, 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
    this.showDeleteModal = false;
    this.compraToDelete = null;
  }

  resetForm(form: any) {
    this.purchaseData = {
      id: undefined,
      fornecedor_id: '',
      tipo: 'venda',
      quantidade: 1,
      valor: 0
    };
    this.isEditMode = false;
    if (form) form.resetForm();
  }

  // Formata o valor usando regex puro para moeda brasileira
  onValorInput(event: any) {
    let valor = event.target.value;
    // Remove tudo que não é dígito ou vírgula
    valor = valor.replace(/[^\d,]/g, '');
    // Garante que só tenha uma vírgula
    const parts = valor.split(',');
    if (parts.length > 2) {
      valor = parts[0] + ',' + parts.slice(1).join('');
    }
    // Limita casas decimais
    if (parts[1]) {
      valor = parts[0] + ',' + parts[1].slice(0, 2);
    }
    // Adiciona separador de milhar
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    this.purchaseData.valor = valor;
  }

  onValorBlur() {
    let valor = this.purchaseData.valor;
    if (typeof valor === 'string') {
      // Remove tudo que não é dígito ou vírgula
      valor = valor.replace(/[^\d,]/g, '');
      // Garante que só tenha uma vírgula
      const parts = valor.split(',');
      if (parts.length > 2) {
        valor = parts[0] + ',' + parts.slice(1).join('');
      }
      // Limita casas decimais
      if (parts[1]) {
        valor = parts[0] + ',' + parts[1].slice(0, 2);
      }
      // Adiciona separador de milhar
      valor = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + (parts[1] ? ',' + parts[1].slice(0, 2) : '');
      this.purchaseData.valor = valor;
    }
  }
}
