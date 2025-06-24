import { Component } from '@angular/core';
import { PageHeader } from '../../molecules/page-header/page-header';
import { CommonModule } from '@angular/common';
import { SalesForm } from '../../organisms/sales-form/sales-form';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, PageHeader, SalesForm], 
  templateUrl: './sales.html',
  styleUrl: './sales.scss'
})
export class Sales {
  showSalesForm = false;

  constructor(private router: Router) {}

  handleNewSale() {
    this.showSalesForm = true;
  }

  handleClosing() {
    this.router.navigate(['/sales-list']);
  }

  closeSalesForm() {
    this.showSalesForm = false;
  }
}