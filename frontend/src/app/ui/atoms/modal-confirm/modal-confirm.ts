import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-modal-confirm',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './modal-confirm.html',
  styleUrls: ['./modal-confirm.scss']
})
export class ModalConfirmComponent {
  @Input() confirmText = 'Confirmar';
  @Output() closed = new EventEmitter<boolean>();

  onClose(result: boolean) {
    this.closed.emit(result);
  }

  onBackdropClick(event: MouseEvent) {
    event.stopPropagation();
    this.onClose(false);
  }
}
