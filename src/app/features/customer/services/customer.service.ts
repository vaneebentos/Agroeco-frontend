
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Customer } from '../models/customer.model';

export interface CreateCustomerResponse {
  message: string;
  customer: Customer;
  created: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = 'http://localhost:3000/customers';

  constructor(private readonly http: HttpClient) {}

  createCustomer(
    data: Partial<Customer>
  ): Observable<CreateCustomerResponse> {
    return this.http.post<CreateCustomerResponse>(this.apiUrl, data);
  }

  findCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/id/${id}`);
  }

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  deleteCustomerById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/id/${id}`);
  }

  updateCustomer(
    id: number,
    data: Partial<Customer>
  ): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/id/${id}`, data);
  }

  searchCustomers(term: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(
      `${this.apiUrl}/search?q=${encodeURIComponent(term)}`
    );
  }

}
