import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ClienteFormData, Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';

import { ClienteFormComponent } from '../cliente-form/cliente-form.component';
import { ClienteDeleteComponent } from '../cliente-delete/cliente-delete.component';

import {
  TablaComponent,
  ColumnaTabla
} from '../../../../shared/components/tabla/tabla.component';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    ClienteFormComponent,
    ClienteDeleteComponent,
    TablaComponent
  ],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent implements OnInit {

  @ViewChild(ClienteFormComponent)
  formularioCliente!: ClienteFormComponent;

  clientes: Cliente[] = [];

  clienteSeleccionado: Cliente | null = null;
  clienteAEliminar: Cliente | null = null;

  errorServidor: string | null = null;
  mensajeExito: string | null = null;

  columnas: ColumnaTabla[] = [
    { campo: 'nombre', titulo: 'Nombre' },
    { campo: 'email', titulo: 'Email' },
    { campo: 'telefono', titulo: 'Teléfono' },
    { campo: 'cuit', titulo: 'CUIT' }
  ];

  constructor(private clienteService: ClienteService) { }

  ngOnInit(): void {
    this.getAllClientes();
  }

  getAllClientes(): void {
    this.clienteService.getAllClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes.filter(cliente => cliente.activo);
      },
      error: (error: HttpErrorResponse) => {
        this.errorServidor =
          error.error?.message || 'Error al obtener los clientes.';
      }
    });
  }

guardarCliente(datos: ClienteFormData): void {
  this.errorServidor = null;
  this.mensajeExito = null;

  if (this.clienteSeleccionado) {
    this.clienteService.updateCliente(this.clienteSeleccionado.id, datos).subscribe({
      next: (respuesta) => {
        this.mensajeExito = 'Cliente actualizado correctamente.';
        this.clienteSeleccionado = null;
        this.formularioCliente.limpiarFormulario();
        this.getAllClientes();
      },
      error: (error: HttpErrorResponse) => {
        this.errorServidor =
          error.error?.message || 'Error al actualizar el cliente.';
      }
    });

  } else {
    this.clienteService.crearCliente(datos).subscribe({
      next: (respuesta) => {
        if (!respuesta.creado) {
          this.errorServidor = respuesta.message;
          return;
        }

        this.mensajeExito = respuesta.message;
        this.formularioCliente.limpiarFormulario();
        this.getAllClientes();
      },
      error: (error: HttpErrorResponse) => {
        this.errorServidor =
          error.error?.message || 'Ocurrió un error al guardar el cliente.';
      }
    });
  }
}

  cancelarFormulario(): void {
    this.clienteSeleccionado = null;
    this.errorServidor = null;
    this.mensajeExito = null;
  }


  editarCliente(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
  }

  eliminarCliente(cliente: Cliente): void {
    this.clienteAEliminar = cliente;
    this.errorServidor = null;
    this.mensajeExito = null;
  }


  confirmarEliminacion(cliente: Cliente): void {
    this.clienteService.deleteClienteById(cliente.id).subscribe({
      next: () => {
        this.mensajeExito = 'Cliente eliminado correctamente.';
        this.clienteAEliminar = null;
        this.getAllClientes();
      },
      error: (error: HttpErrorResponse) => {
        this.errorServidor =
          error.error?.message || 'Error al eliminar el cliente.';
      }
    });
  }


  cancelarEliminacion(): void {
    this.clienteAEliminar = null;
  }

}