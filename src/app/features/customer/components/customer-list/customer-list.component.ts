import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { CustomerFormData, Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';

import { CustomerFormComponent } from '../customer-form/customer-form.component';
import { CustomerDeleteComponent } from '../customer-delete/customer-delete.component';

import {
  TableComponent,
  TableColumn
} from '../../../../shared/components/table/table.component';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CustomerFormComponent,
    CustomerDeleteComponent,
    TableComponent,
    ModalComponent
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {

  customers: Customer[] = [];

  selectedCustomer: Customer | null = null;
  customerToDelete: Customer | null = null;


  serverError: string | null = null;
  successMessage: string | null = null;

  isModalOpen = false;
  modalType: 'form' | 'delete' | null = null;

  searchTerm = '';

  columns: TableColumn[] = [
    { field: 'name', title: 'Nombre' },
    { field: 'email', title: 'Email' },
    { field: 'phone', title: 'Teléfono' },
    { field: 'cuit', title: 'CUIT' }
  ];

  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.getAllCustomers();
  }

  getAllCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers.filter(customer => customer.active);
      },
      error: (error: HttpErrorResponse) => {
        this.serverError =
          error.error?.message || 'Error al obtener los clientes.';
      }
    });
  }

  openCreateCustomer(): void {
    this.selectedCustomer = null;
    this.serverError = null;
    this.successMessage = null;

    this.modalType = 'form';
    this.isModalOpen = true;
  }


  editCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.serverError = null;
    this.successMessage = null;

    this.modalType = 'form';
    this.isModalOpen = true;
  }


  deleteCustomer(customer: Customer): void {
    this.customerToDelete = customer;
    this.serverError = null;
    this.successMessage = null;

    this.modalType = 'delete';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalType = null;
    this.selectedCustomer = null;
    this.customerToDelete = null;
    this.serverError = null;
  }

  saveCustomer(data: CustomerFormData): void {
    this.serverError = null;
    this.successMessage = null;

    if (this.selectedCustomer) {
      this.customerService.updateCustomer(
        this.selectedCustomer.id,
        data
      ).subscribe({
        next: () => {
          this.successMessage = 'Cliente actualizado correctamente.';
          this.closeModal();
          this.getAllCustomers();
        },
        error: (error: HttpErrorResponse) => {
          this.serverError =
            error.error?.message || 'Error al actualizar el cliente.';
        }
      });

    } else {
      this.customerService.createCustomer(data).subscribe({
        next: (response) => {
          if (!response.created) {
            this.serverError = response.message;
            return;
          }

          this.successMessage = response.message;
          this.closeModal();
          this.getAllCustomers();
        },
        error: (error: HttpErrorResponse) => {
          this.serverError =
            error.error?.message || 'Ocurrió un error al guardar el cliente.';
        }
      });
    }
  }

  confirmDeletion(customer: Customer): void {
    this.customerService.deleteCustomerById(customer.id).subscribe({
      next: () => {
        this.successMessage = 'Cliente eliminado correctamente.';
        this.closeModal();
        this.getAllCustomers();
      },
      error: (error: HttpErrorResponse) => {
        this.serverError =
          error.error?.message || 'Error al eliminar el cliente.';
      }
    });
  }


  searchCustomers(term: string): void {
    this.searchTerm = term;

    if (!term.trim()) {
      this.getAllCustomers();
      return;
    }

    this.customerService.searchCustomers(term).subscribe({
      next: (customers) => {
        this.customers = customers.filter(customer => customer.active);
        this.serverError = null;
      },
      error: (error: HttpErrorResponse) => {
        this.serverError =
          error.error?.message || 'Error al buscar clientes.';
      }
    });
  }

}
