import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { SalesService, Sale } from '../../../core/application/sales.service';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, RouterModule],
  templateUrl: './sales-list.html',
  styleUrls: ['./sales-list.scss']
})
export class SalesList {
  sales: Sale[] = [];
  displayedColumns: string[] = ['id', 'total', 'date', 'products'];

  constructor(private salesService: SalesService, private router: Router) {}

  ngOnInit(): void {
    this.salesService.getSales().subscribe(
      (data: Sale[]) => {
        this.sales = data;
      },
      (error) => {
        console.error('Erro ao carregar vendas:', error);
        alert('Erro ao carregar as vendas.');
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/sales']);
  }
}