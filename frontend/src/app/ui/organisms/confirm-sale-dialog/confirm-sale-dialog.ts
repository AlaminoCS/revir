import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Sale } from '../../../core/domain/models';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-sale-dialog',
  templateUrl: './confirm-sale-dialog.html',
  styleUrls: ['./confirm-sale-dialog.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class ConfirmSaleDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmSaleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { sale: Sale }
  ) {}
}