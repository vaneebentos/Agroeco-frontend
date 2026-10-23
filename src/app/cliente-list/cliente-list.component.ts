
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ClienteService } from '../shared/cliente.service';
import { Cliente } from '../shared/cliente';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent implements OnInit {
  clientes: Cliente[] = [];
  cargando = false;
  error = '';
  mensaje = '';
  busqueda = '';

  mostrarFormulario = false;

  nuevoCliente = {
    nombre: '',
    email: '',
    telefono: ''
  };

  clienteEditandoId: number | null = null;

  clienteEditando: {
    nombre: string;
    email: string;
    telefono: string | null;
  } = {
    nombre: '',
    email: '',
    telefono: ''
  };

  constructor(private readonly clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  abrirFormulario(): void {
    this.error = '';
    this.mensaje = '';
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.error = '';
    this.nuevoCliente = {
      nombre: '',
      email: '',
      telefono: ''
    };
  }

  @HostListener('document:keydown.escape')
  cerrarFormularioConEscape(): void {
    if (this.mostrarFormulario) {
      this.cerrarFormulario();
    }
  }

  get clientesFiltrados(): Cliente[] {
  const termino = this.busqueda.trim().toLowerCase();

  if (!termino) {
    return this.clientes;
  }

  return this.clientes.filter(cliente =>
    cliente.id.toString().includes(termino) ||
    cliente.nombre.toLowerCase().includes(termino) ||
    cliente.email.toLowerCase().includes(termino)
  );
}

  // Obtener todos los clientes
  cargarClientes(): void {
    this.cargando = true;
    this.error = '';

    this.clienteService.getAllClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.error = 'No se pudieron cargar los clientes.';
        this.cargando = false;
      }
    });
  }

  // Crear un cliente
  crearCliente(): void {
    this.error = '';
    this.mensaje = '';

    this.clienteService.crearCliente(this.nuevoCliente).subscribe({
      next: (respuesta) => {
        this.mensaje = respuesta.message;

        this.cerrarFormulario();
        this.cargarClientes();
      },
      error: (err) => {
        console.error('Error al crear cliente:', err);
        this.error = 'No se pudo guardar el cliente.';
      }
    });
  }

  // Cargar los datos del cliente seleccionado
  editarCliente(cliente: Cliente): void {
    this.clienteEditandoId = cliente.id;

    this.clienteEditando = {
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono ?? ''
    };

    this.error = '';
    this.mensaje = '';
  }

  // Guardar los cambios del cliente
  guardarEdicion(): void {
    if (this.clienteEditandoId === null) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    this.clienteService
      .updateCliente(this.clienteEditandoId, this.clienteEditando)
      .subscribe({
        next: () => {
          this.mensaje = 'Cliente actualizado correctamente.';
          this.cancelarEdicion();
          this.cargarClientes();
        },
        error: (err) => {
          console.error('Error al actualizar cliente:', err);
          this.error = 'No se pudo actualizar el cliente.';
        }
      });
  }

  // Cancelar la edición
  cancelarEdicion(): void {
    this.clienteEditandoId = null;

    this.clienteEditando = {
      nombre: '',
      email: '',
      telefono: ''
    };
  }

  // Eliminar un cliente
  eliminarCliente(cliente: Cliente): void {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar al cliente ${cliente.nombre}?`
    );

    if (!confirmar) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    this.clienteService.deleteClienteById(cliente.id).subscribe({
      next: () => {
        this.mensaje = 'Cliente eliminado correctamente.';
        this.cargarClientes();
      },
      error: (err) => {
        console.error('Error al eliminar cliente:', err);
        this.error = 'No se pudo eliminar el cliente.';
      }
    });
  }
}
