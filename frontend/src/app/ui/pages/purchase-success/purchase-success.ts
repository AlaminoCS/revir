import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../molecules/page-header/page-header';
import { SalesForm } from '../../organisms/sales-form/sales-form';

@Component({
  selector: 'app-purchase-success',
  standalone: true,
  imports: [CommonModule, PageHeader ],
  templateUrl: './purchase-success.html',
  styleUrls: ['./purchase-success.scss']
})
export class PurchaseSuccess {

 
}