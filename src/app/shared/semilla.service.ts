import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Semilla } from './semilla';

@Injectable({
  providedIn: 'root'
})
export class SemillaService {

  private readonly apiUrl = 'http://localhost:3000/semillas';

  constructor(private readonly http: HttpClient) { }

  getSemillas(): Observable<Semilla[]> {
    return this.http.get<Semilla[]>(this.apiUrl);
  }

  getSemillaById(id: string): Observable<Semilla> {
    return this.http.get<Semilla>(`${this.apiUrl}/${id}`);
  }

  createSemilla(semilla: Partial<Semilla>): Observable<Semilla> {
    return this.http.post<Semilla>(this.apiUrl, semilla);
  }

  updateSemilla(id: string, semilla: Partial<Semilla>): Observable<Semilla> {
    return this.http.put<Semilla>(`${this.apiUrl}/${id}`, semilla);
  }

  deleteSemilla(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}