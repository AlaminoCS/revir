import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

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
  priceButtons = [10, 15, 20, 25];
  filteredPrices = [...this.priceButtons];
  selectedProducts: {name: string, price: number}[] = [];
  
  displayedColumns: string[] = ['product', 'price', 'actions'];
  
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
    // Lógica de desconto será implementada aqui
    alert('Funcionalidade de desconto será implementada em breve!');
  }

  onCheckout(): void {
    if (this.selectedProducts.length === 0) {
      alert('Adicione produtos antes de fechar a venda!');
      return;
    }
    alert(`Venda finalizada! Total: R$ ${this.total.toFixed(2)}`);
    this.selectedProducts = [];
  }
}