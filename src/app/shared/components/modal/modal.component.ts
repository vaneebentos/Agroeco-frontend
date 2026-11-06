
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  @Input() title: string = '';
  @Input() open: boolean = false;

  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }
}
