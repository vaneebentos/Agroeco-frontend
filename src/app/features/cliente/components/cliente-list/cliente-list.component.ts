
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ClienteFormData, Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';

import { ClienteFormComponent } from '../cliente-form/cliente-form.component';
import { ClienteDeleteComponent } from '../cliente-delete/cliente-delete.component';

import {
  TablaComponent,
  ColumnaTabla
} from '../../../../shared/components/tabla/tabla.component';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [
    ClienteFormComponent,
    ClienteDeleteComponent,
    TablaComponent,
    ModalComponent
  ],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent implements OnInit {

  clientes: Cliente[] = [];

  clienteSeleccionado: Cliente | null = null;
  clienteAEliminar: Cliente | null = null;

  errorServidor: string | null = null;
  mensajeExito: string | null = null;

  modalAbierto = false;
  tipoModal: 'formulario' | 'eliminar' | null = null;

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

  abrirCrearCliente(): void {
    this.clienteSeleccionado = null;
    this.errorServidor = null;
    this.mensajeExito = null;

    this.tipoModal = 'formulario';
    this.modalAbierto = true;
  }


  editarCliente(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.errorServidor = null;
    this.mensajeExito = null;

    this.tipoModal = 'formulario';
    this.modalAbierto = true;
  }


  eliminarCliente(cliente: Cliente): void {
    this.clienteAEliminar = cliente;
    this.errorServidor = null;
    this.mensajeExito = null;

    this.tipoModal = 'eliminar';
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.tipoModal = null;
    this.clienteSeleccionado = null;
    this.clienteAEliminar = null;
    this.errorServidor = null;
  }

  guardarCliente(datos: ClienteFormData): void {
    this.errorServidor = null;
    this.mensajeExito = null;

    if (this.clienteSeleccionado) {
      this.clienteService.updateCliente(
        this.clienteSeleccionado.id,
        datos
      ).subscribe({
        next: () => {
          this.mensajeExito = 'Cliente actualizado correctamente.';
          this.cerrarModal();
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
          this.cerrarModal();
          this.getAllClientes();
        },
        error: (error: HttpErrorResponse) => {
          this.errorServidor =
            error.error?.message || 'Ocurrió un error al guardar el cliente.';
        }
      });
    }
  }

  confirmarEliminacion(cliente: Cliente): void {
    this.clienteService.deleteClienteById(cliente.id).subscribe({
      next: () => {
        this.mensajeExito = 'Cliente eliminado correctamente.';
        this.cerrarModal();
        this.getAllClientes();
      },
      error: (error: HttpErrorResponse) => {
        this.errorServidor =
          error.error?.message || 'Error al eliminar el cliente.';
      }
    });
  }

}
