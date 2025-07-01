import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Product, Sale } from '../../../core/domain/models';
import { SalesService } from '../../../core/application/sales.service';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmSaleDialog } from '../confirm-sale-dialog/confirm-sale-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    MatRadioModule,
    MatDialogModule
  ],
  templateUrl: './sales-form.html',
  styleUrls: ['./sales-form.scss']
})
export class SalesForm {
  @Output() closeForm = new EventEmitter<void>();
  
  searchTerm = '';
  priceButtons = [10, 15, 20, 25, 30, 35, 40, 45, 55, 65, 75, 85, 95, 125, 135, 145, 155];
  filteredPrices = [...this.priceButtons];
  selectedProducts: {name: string, price: number}[] = [];

  // Adicione no componente
  paymentMethods = ['pix', 'dinheiro', 'crédito', 'débito', 'outro'] as const;
  selectedPaymentMethod: 'pix' | 'dinheiro' | 'crédito' | 'débito' | 'outro' = 'pix';
  
  displayedColumns: string[] = ['product', 'price', 'actions'];
  isProcessing = false;

  constructor(
    private salesService: SalesService,
    private dialog: MatDialog, // Já estava aqui
    private snackBar: MatSnackBar // Adicione esta linha
  ) {}

  get total(): number {
    return this.selectedProducts.reduce((sum, product) => sum + product.price, 0);
  }

  filterPrices(): void {
    if (!this.searchTerm) {
      this.filteredPrices = [...this.priceButtons];
      return;
    }
    
    this.filteredPrices = this.priceButtons.filter(price => 
      price.toString().includes(this.searchTerm)
    );
  }

  addProduct(price: number): void {
    const product = {
      name: `Peça R$ ${price.toFixed(2)}`,
      price: price
    };
    this.selectedProducts = [...this.selectedProducts, product]; 
    this.searchTerm = '';
    this.filteredPrices = [...this.priceButtons];
  }

  removeProduct(index: number): void {
    const updated = [...this.selectedProducts];
    updated.splice(index, 1);
    this.selectedProducts = updated; 
  }

  onCancel(): void {
    this.selectedProducts = [];
    this.closeForm.emit();
  }

  onDiscount(): void {
    alert('Funcionalidade de desconto será implementada em breve!');
  }

  // ... no método onCheckout:
  onCheckout(): void {
    if (this.selectedProducts.length === 0) {
      this.snackBar.open('Adicione produtos antes de fechar a venda!', 'Fechar', {
        duration: 3000
      });
      return;
    }

    const sale: Sale = {
      products: this.selectedProducts.map(p => ({ 
        name: p.name, 
        price: p.price,
        quantity: 1
      })),
      total: this.total,
      payment_method: this.selectedPaymentMethod
    };

    const dialogRef = this.dialog.open(ConfirmSaleDialog, {
      width: '500px',
      data: { sale },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isProcessing = true;
        this.salesService.registerSale(sale).subscribe({
          next: (response) => {
            this.isProcessing = false;
            this.snackBar.open('Venda registrada com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
            this.selectedProducts = [];
            this.closeForm.emit();
          },
          error: (error) => {
            this.isProcessing = false;
            this.snackBar.open(
              error.error?.message || 'Erro ao registrar venda!', 
              'Fechar', 
              { duration: 3000, panelClass: 'error-snackbar' }
            );
          }
        });
      }
    });
  }
}