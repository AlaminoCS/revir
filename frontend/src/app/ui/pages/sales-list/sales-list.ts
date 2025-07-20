import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';

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
    MatButtonToggleModule
  ],
  templateUrl: './sales-list.html',
  styleUrls: ['./sales-list.scss']
})
export class SalesList implements AfterViewInit {
  dataSource = new MatTableDataSource<Sale>();
  displayedColumns: string[] = ['id', 'total', 'payment', 'date', 'products'];
  paymentMethods = ['pix', 'dinheiro', 'crédito', 'débito', 'outro'];

  selectedRange: 'day' | 'month' | 'custom' = 'day';
  totalSales: number = 0;
  totalAmount: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchControl = new FormControl('');
  paymentMethodControl = new FormControl('todos');
  monthControl = new FormControl(new Date());
  dateFromControl = new FormControl();
  dateToControl = new FormControl();

  constructor(
    private salesService: SalesService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;

  this.dataSource.filterPredicate = this.createFilter();

  this.searchControl.valueChanges
    .pipe(debounceTime(300), distinctUntilChanged())
    .subscribe(() => this.applyFilter());

  this.paymentMethodControl.valueChanges.subscribe(() => this.applyFilter());
  this.monthControl.valueChanges.subscribe(() => this.applyMonthFilter());
  this.dateFromControl.valueChanges.subscribe(() => this.applyFilter());
  this.dateToControl.valueChanges.subscribe(() => this.applyFilter());

  // 👇 Corrigir seleção visual para refletir o filtro real
  this.selectedRange = 'month'; 
  this.applyMonthFilter();

  this.loadSales();
}


  loadSales(): void {
    this.salesService.getSales().subscribe({
      next: (data) => {
        this.dataSource.data = data.map(sale => ({
          ...sale,
          date: sale.created_at || sale.date || new Date().toISOString()
        }));
        this.updateTotals();
      },
      error: (error) => console.error('Erro ao carregar vendas:', error)
    });
  }

  onRangeChange(event?: MatButtonToggleChange): void {
    if (!event) return;

    this.selectedRange = event.value;
    this.clearFilters();

    if (this.selectedRange === 'month') {
      this.applyMonthFilter();
    } else {
      this.applyFilter();
    }
  }

  onMonthSelected(event: any): void {
    this.monthControl.setValue(event);
    this.applyMonthFilter();
  }

  applyMonthFilter(): void {
    if (!this.monthControl.value) return;

    const selectedMonth = this.monthControl.value;
    const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

    this.dateFromControl.setValue(firstDay);
    this.dateToControl.setValue(lastDay);
    this.applyFilter();
  }

  getSafeDate(date: string | Date | undefined): Date {
    if (!date) return new Date();
    return typeof date === 'string' ? new Date(date) : date;
  }

  applyFilter(): void {
    let dateFrom: Date | null = null;
    let dateTo: Date | null = null;

    if (this.selectedRange === 'day') {
      const today = new Date();
      dateFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      dateTo = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    }
    else if (this.selectedRange === 'month') {
      const selectedMonth = this.monthControl.value || new Date();
      dateFrom = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      dateTo = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);
    }
    else if (this.selectedRange === 'custom') {
      const from = this.dateFromControl.value;
      const to = this.dateToControl.value;

      dateFrom = from ? this.getSafeDate(from) : null;
      dateTo = to ? this.getSafeDate(to) : null;
      if (dateTo) dateTo.setHours(23, 59, 59, 999); // Inclui o final do dia
    }

    const filterValue = {
      search: this.searchControl.value?.trim().toLowerCase() || '',
      paymentMethod: this.paymentMethodControl.value || 'todos',
      dateFrom: dateFrom ? dateFrom.toISOString() : null,
      dateTo: dateTo ? dateTo.toISOString() : null
    };

    this.dataSource.filter = JSON.stringify(filterValue);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.updateTotals();
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

      const saleDate = this.getSafeDate(data.date);
      const matchesDateFrom = !searchTerms.dateFrom || saleDate >= new Date(searchTerms.dateFrom);
      const matchesDateTo = !searchTerms.dateTo || saleDate <= new Date(searchTerms.dateTo);

      return matchesSearch && matchesPayment && matchesDateFrom && matchesDateTo;
    };
  }

  updateTotals(): void {
    const sales = this.dataSource.filteredData;

    this.totalSales = sales.length;
    this.totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.paymentMethodControl.setValue('todos');
    this.dateFromControl.setValue(null);
    this.dateToControl.setValue(null);

    if (this.selectedRange === 'month') {
      this.monthControl.setValue(new Date());
      this.applyMonthFilter();
    } else {
      this.applyFilter();
    }
  }

  goBack(): void {
    this.router.navigate(['/sales']);
  }
}
