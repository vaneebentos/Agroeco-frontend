
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Cliente } from '../models/cliente.model';

export interface CrearClienteResponse {
  message: string;
  cliente: Cliente;
  creado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly apiUrl = 'http://localhost:3000/clientes';

  constructor(private readonly http: HttpClient) {}

crearCliente(
  data: Partial<Cliente>
): Observable<CrearClienteResponse> {
  return this.http.post<CrearClienteResponse>(this.apiUrl, data);
}

  findClienteByEmail(email: string): Observable<Cliente> {
    return this.http.get<Cliente>(
      `${this.apiUrl}/${encodeURIComponent(email)}`
    );
  }

  findClienteById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/id/${id}`);
  }

  getAllClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  deleteClienteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/id/${id}`);
  }

  updateCliente(
    id: number,
    data: Partial<Cliente>
  ): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/id/${id}`, data);
  }
}
