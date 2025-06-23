import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header {
  menuItems = [
    { name: 'Vendas', route: '/vendas' },
    { name: 'Relatório', route: '/relatorios' },
    { name: 'Fornecedores', route: '/fornecedores' },
    { name: 'Produtos', route: '/produtos' }
  ];
}