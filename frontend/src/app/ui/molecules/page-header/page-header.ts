import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.scss']
})
export class PageHeader {
  @Input() greeting?: string;
  @Input() title: string = '';
  @Input() showSaleButtons: boolean = false;
  
  @Output() onNewSale = new EventEmitter<void>();
  @Output() onClosing = new EventEmitter<void>();
}