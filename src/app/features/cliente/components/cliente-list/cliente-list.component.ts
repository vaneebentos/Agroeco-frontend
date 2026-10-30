import { Component, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ClienteFormData, Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { ClienteFormComponent } from '../cliente-form/cliente-form.component';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [ClienteFormComponent],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent {

  @ViewChild(ClienteFormComponent)
  formularioCliente!: ClienteFormComponent;

  clienteSeleccionado: Cliente | null = null;
  errorServidor: string | null = null;
  mensajeExito: string | null = null;

  constructor(private clienteService: ClienteService) {}

  guardarCliente(datos: ClienteFormData): void {
    this.errorServidor = null;
    this.mensajeExito = null;

    this.clienteService.crearCliente(datos).subscribe({
      next: (respuesta) => {
        if (!respuesta.creado) {
          this.errorServidor = respuesta.message;
          return;
        }

        this.mensajeExito = respuesta.message;
        this.clienteSeleccionado = null;
        this.formularioCliente.limpiarFormulario();
      },
      error: (error: HttpErrorResponse) => {
        this.errorServidor =
          error.error?.message || 'Ocurrió un error al guardar el cliente.';
      }
    });
  }

  cancelarFormulario(): void {
    this.clienteSeleccionado = null;
    this.errorServidor = null;
    this.mensajeExito = null;
  }
}