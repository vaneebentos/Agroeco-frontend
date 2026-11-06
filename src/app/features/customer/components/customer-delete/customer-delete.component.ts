import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-delete',
  standalone: true,
  templateUrl: './customer-delete.component.html',
  styleUrl: './customer-delete.component.css'
})
export class CustomerDeleteComponent {

  @Input() customer: Customer | null = null;

  @Output() confirm = new EventEmitter<Customer>();
  @Output() cancel = new EventEmitter<void>();

  confirmDeletion(): void {
    if (this.customer) {
      this.confirm.emit(this.customer);
    }
  }

  cancelDeletion(): void {
    this.cancel.emit();
  }
}
