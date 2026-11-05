import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Semilla } from './semilla';

const TEMPORADAS_DEFAULT = ['2025/26 Temprana', '2025/26 Tardía'];

@Injectable({
  providedIn: 'root'
})
export class SemillaService {

  private readonly apiUrl = 'http://localhost:3000/semillas';

  constructor(private readonly http: HttpClient) { }

  getSemillas(): Observable<Semilla[]> {
    return this.http.get<Semilla[]>(this.apiUrl).pipe(
      map(semillas =>
        semillas.map(s => ({
          ...s,
          temporadasDisponibles: s.temporadasDisponibles?.length
            ? s.temporadasDisponibles
            : TEMPORADAS_DEFAULT
        }))
      )
    );
  }

  getSemillaById(id: string): Observable<Semilla> {
    return this.http.get<Semilla>(`${this.apiUrl}/${id}`).pipe(
      map(s => ({
        ...s,
        temporadasDisponibles: s.temporadasDisponibles?.length
          ? s.temporadasDisponibles
          : TEMPORADAS_DEFAULT
      }))
    );
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
