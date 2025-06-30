import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { SalesService, Sale } from '../../../core/application/sales.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, RouterModule],
  templateUrl: './sales-list.html',
  styleUrls: ['./sales-list.scss']
})
export class SalesList {
  dataSource = new MatTableDataSource<Sale>();
  displayedColumns: string[] = ['id', 'total', 'date', 'products'];

  constructor(
    private salesService: SalesService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales(): void {
    this.salesService.getSales().subscribe(
      (data: any[]) => {
        // Transforma os dados se necessário
        const formattedData = data.map(sale => ({
          ...sale,
          date: sale.created_at || sale.date
        }));
        
        this.dataSource = new MatTableDataSource(formattedData);
        this.cdr.detectChanges();
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