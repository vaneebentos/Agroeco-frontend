import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-delete',
  standalone: true,
  templateUrl: './cliente-delete.component.html',
  styleUrl: './cliente-delete.component.css'
})
export class ClienteDeleteComponent {

  @Input() cliente: Cliente | null = null;

  @Output() confirmar = new EventEmitter<Cliente>();
  @Output() cancelar = new EventEmitter<void>();

  confirmarEliminacion(): void {
    if (this.cliente) {
      this.confirmar.emit(this.cliente);
    }
  }

  cancelarEliminacion(): void {
    this.cancelar.emit();
  }
}