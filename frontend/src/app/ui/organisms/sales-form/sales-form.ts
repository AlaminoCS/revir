import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Product, Sale } from '../../../core/domain/models';
import { SalesService } from '../../../core/application/sales.service';

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatIconModule
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
  
  displayedColumns: string[] = ['product', 'price', 'actions'];

  constructor(private salesService: SalesService) {}

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

  onCheckout(): void {
    if (this.selectedProducts.length === 0) {
      alert('Adicione produtos antes de fechar a venda!');
      return;
    }

    const sale: Sale = {
      products: this.selectedProducts.map(p => ({ 
        name: p.name, 
        price: p.price,
        quantity: 1 // Adicionando quantidade padrão
      })),
      total: this.total,
      id: 0, // Valor temporário
      date: new Date().toISOString()
    };

    this.salesService.registerSale(sale).subscribe({
      next: (response) => {
        alert(response.message); // "Venda registrada com sucesso"
        this.selectedProducts = [];
        this.closeForm.emit(); // Fecha o formulário após sucesso
      },
      error: (error) => {
        console.error('Erro:', error);
        alert(error.error?.message || 'Erro ao registrar venda');
      }
    });
  }
}