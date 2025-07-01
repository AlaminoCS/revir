import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { SalesService, Sale } from '../../../core/application/sales.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './sales-list.html',
  styleUrls: ['./sales-list.scss']
})
export class SalesList implements AfterViewInit {
  dataSource = new MatTableDataSource<Sale>();
  displayedColumns: string[] = ['id', 'total', 'payment', 'date', 'products'];
  paymentMethods = ['todos', 'pix', 'dinheiro', 'crédito', 'débito', 'outro'];

  totalSalesToday: number = 0;
  totalAmountToday: number = 0;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  searchControl = new FormControl('');
  paymentMethodControl = new FormControl('todos');
  dateFromControl = new FormControl();
  dateToControl = new FormControl();

  constructor(
    private salesService: SalesService, 
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Configurar filtro personalizado
    this.dataSource.filterPredicate = this.createFilter();
    
    // Observar cambios en los filtros
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyFilter());
      
    this.paymentMethodControl.valueChanges.subscribe(() => this.applyFilter());
    this.dateFromControl.valueChanges.subscribe(() => this.applyFilter());
    this.dateToControl.valueChanges.subscribe(() => this.applyFilter());
    
    this.loadSales();
  }

  loadSales(): void {
    this.salesService.getSales().subscribe({
      next: (data) => {
        this.dataSource.data = data.map(sale => ({
          ...sale,
          date: sale.created_at || sale.date || new Date().toISOString()
        }));
        
        // Calcular totais do dia
        this.calculateDailyTotals(data);
      },
      error: (error) => {
        console.error('Erro ao carregar vendas:', error);
        alert('Erro ao carregar vendas. Tente novamente.');
      }
    });
  }

  calculateDailyTotals(sales: Sale[]): void {
    const today = new Date().toISOString().split('T')[0];
    
    const todaySales = sales.filter(sale => {
      // Verifica se existe date ou created_at e fornece um fallback
      const saleDateStr = sale.date || sale.created_at || new Date().toISOString();
      const saleDate = new Date(saleDateStr).toISOString().split('T')[0];
      return saleDate === today;
    });
    
    this.totalSalesToday = todaySales.length;
    this.totalAmountToday = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  }

  createFilter(): (data: Sale, filter: string) => boolean {
    return (data, filter) => {
      const searchTerms = JSON.parse(filter);
      const matchesSearch = !searchTerms.search || 
        data.id?.toString().includes(searchTerms.search) || 
        data.total.toString().includes(searchTerms.search) ||
        data.payment_method.includes(searchTerms.search) ||
        data.products.some(p => p.name.toLowerCase().includes(searchTerms.search.toLowerCase()));
      
      const matchesPayment = searchTerms.paymentMethod === 'todos' || 
        data.payment_method === searchTerms.paymentMethod;
      
      const saleDate = new Date(data.date || new Date().toISOString());
      const matchesDateFrom = !searchTerms.dateFrom || 
        saleDate >= new Date(searchTerms.dateFrom);
      
      const matchesDateTo = !searchTerms.dateTo || 
        saleDate <= new Date(searchTerms.dateTo + 'T23:59:59');
      
      return matchesSearch && matchesPayment && matchesDateFrom && matchesDateTo;
    };
  }

  applyFilter(): void {
    const filterValue = {
      search: this.searchControl.value?.trim().toLowerCase() || '',
      paymentMethod: this.paymentMethodControl.value || 'todos',
      dateFrom: this.dateFromControl.value,
      dateTo: this.dateToControl.value
    };
    
    this.dataSource.filter = JSON.stringify(filterValue);
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.paymentMethodControl.setValue('todos');
    this.dateFromControl.setValue(null);
    this.dateToControl.setValue(null);
  }

  goBack(): void {
    this.router.navigate(['/sales']);
  }
}