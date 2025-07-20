import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';
import { SalesService } from '../../../core/application/sales.service';
import { Sale } from '../../../core/domain/models';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    MatCardModule,
    MatGridListModule,
    NgIf,
    NgFor,
    DecimalPipe // ✅ necessário para o pipe `number`
  ],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss'],
})
export class Reports implements AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentChart') paymentChartRef!: ElementRef<HTMLCanvasElement>;

  salesChart!: Chart;
  paymentChart!: Chart;

  // 🔢 Dados dos cards
  totalVendas = 0;
  totalPecas = 0;
  totalDescontos = 0;

  // 📊 Comparação semanal
  vendasSemanaAtual = 0;
  vendasSemanaAnterior = 0;
  variacaoPercentual = 0;
  variacaoAbsoluta = 0;

  constructor(
    private salesService: SalesService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef 
  ) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.salesService.getSales().subscribe(sales => {
      this.processSummaryData(sales);

      // Força a view a atualizar imediatamente após os dados serem definidos
      this.cdr.detectChanges();

      this.renderSalesChart(sales);
      this.renderPaymentChart(sales);
    });
  }

  formatarMilhar(valor: number): string {
    const milhar = valor / 1000;
    return milhar >= 1 ? milhar.toFixed(1) + 'k' : (valor).toString();
  }

  private processSummaryData(sales: Sale[]) {
    console.log('Dados das vendas:', sales);

    // Soma total das vendas
    this.totalVendas = sales.reduce((sum, s) => sum + s.total, 0);
    this.totalPecas = sales.reduce((sum, s) => sum + s.products.length, 0);
    this.totalDescontos = 0;

    // Cálculo da comparação semanal
    this.calcularComparacaoDeVendas(sales);
  }

  private calcularComparacaoDeVendas(sales: Sale[]) {
    const hoje = new Date();
    const inicioSemanaAtual = this.getStartOfWeek(hoje);
    const inicioSemanaAnterior = this.getStartOfWeek(new Date(hoje));
    inicioSemanaAnterior.setDate(inicioSemanaAnterior.getDate() - 7);

    const fimSemanaAtual = new Date(inicioSemanaAtual);
    fimSemanaAtual.setDate(fimSemanaAtual.getDate() + 6);
    fimSemanaAtual.setHours(23, 59, 59, 999);

    const fimSemanaAnterior = new Date(inicioSemanaAnterior);
    fimSemanaAnterior.setDate(fimSemanaAnterior.getDate() + 6);
    fimSemanaAnterior.setHours(23, 59, 59, 999);

    let somaSemanaAtual = 0;
    let somaSemanaAnterior = 0;

    for (const venda of sales) {
      const rawDate = venda.created_at || venda.date;

      if (!rawDate) {
        console.warn('Data inválida na venda:', venda);
        return; // pula esta venda
      }

      const dataVenda = new Date(rawDate);
      if (dataVenda >= inicioSemanaAtual && dataVenda <= fimSemanaAtual) {
        somaSemanaAtual += venda.total;
      } else if (dataVenda >= inicioSemanaAnterior && dataVenda <= fimSemanaAnterior) {
        somaSemanaAnterior += venda.total;
      }
    }

    this.vendasSemanaAtual = somaSemanaAtual;
    this.vendasSemanaAnterior = somaSemanaAnterior;

    // Cálculo da variação absoluta
    this.variacaoAbsoluta = somaSemanaAtual - somaSemanaAnterior;

    // Cálculo da variação percentual
    if (somaSemanaAnterior !== 0) {
      this.variacaoPercentual = ((this.variacaoAbsoluta / somaSemanaAnterior) * 100);
    } else {
      this.variacaoPercentual = somaSemanaAtual > 0 ? 100 : 0;
    }

    console.log(`Semana atual: R$${somaSemanaAtual}`);
    console.log(`Semana anterior: R$${somaSemanaAnterior}`);
    console.log(`Variação %: ${this.variacaoPercentual.toFixed(2)}%`);
  }

  private getStartOfWeek(date: Date): Date {
    const day = date.getDay(); // 0 = domingo, 1 = segunda...
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // ajusta para segunda-feira como início da semana
    const startOfWeek = new Date(date.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  private renderSalesChart(sales: Sale[]) {
    const salesMap = new Map<string, number>();

    sales.forEach(sale => {
      const rawDate = sale.created_at ?? sale.date;
      if (!rawDate) return;

      const date = new Date(rawDate).toISOString().split('T')[0];
      const total = salesMap.get(date) || 0;
      salesMap.set(date, total + sale.total);
    });

    const labels = Array.from(salesMap.keys()).sort();
    const data = labels.map(date => salesMap.get(date) || 0);

    this.salesChart = new Chart(this.salesChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Vendas diárias',
            data,
            borderColor: '#3f51b5',
            backgroundColor: 'rgba(63, 81, 181, 0.2)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  private renderPaymentChart(sales: Sale[]) {
    const methodMap = new Map<string, number>();

    sales.forEach(sale => {
      const method = sale.payment_method || 'Desconhecido';
      const total = methodMap.get(method) || 0;
      methodMap.set(method, total + sale.total);
    });

    const labels = Array.from(methodMap.keys());
    const data = Array.from(methodMap.values());

    this.paymentChart = new Chart(this.paymentChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label: 'Forma de pagamento',
            data,
            backgroundColor: [
              '#42A5F5',
              '#66BB6A',
              '#FFA726',
              '#AB47BC',
              '#FF7043',
              '#26A69A',
            ],
            hoverOffset: 12,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }
}