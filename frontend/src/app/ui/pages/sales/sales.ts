import { Component } from '@angular/core';
import { PageHeader } from '../../molecules/page-header/page-header';
import { CommonModule } from '@angular/common';
import { SalesForm } from '../../organisms/sales-form/sales-form';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, PageHeader, SalesForm], 
  templateUrl: './sales.html',
  styleUrl: './sales.scss'
})
export class Sales {
  showSalesForm = false;

  handleNewSale() {
    this.showSalesForm = true;
  }

  handleClosing() {
    console.log('Fechamento clicado');
  }

  closeSalesForm() {
    this.showSalesForm = false;
  }
}