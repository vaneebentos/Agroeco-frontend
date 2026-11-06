import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { Semilla } from './semilla';

const TEMPORADAS_POR_DEFECTO = ['2025/26 Temprana', '2025/26 Tardía'];

@Injectable({
  providedIn: 'root'
})
export class SemillaService {

  private readonly urlApi = 'http://localhost:3000/semillas';

  constructor(private readonly http: HttpClient) { }

  obtenerSemillas(): Observable<Semilla[]> {
    return this.http.get<Semilla[]>(this.urlApi).pipe(
      map(semillas =>
        semillas.map(s => ({
          ...s,
          temporadasDisponibles: s.temporadasDisponibles?.length
            ? s.temporadasDisponibles
            : TEMPORADAS_POR_DEFECTO
        }))
      )
    );
  }

  obtenerCatalogoAdmin(): Observable<Semilla[]> {
    return this.http.get<Semilla[]>(`${this.urlApi}/catalogo`).pipe(
      map(semillas =>
        semillas.map(s => ({
          ...s,
          temporadasDisponibles: s.temporadasDisponibles?.length
            ? s.temporadasDisponibles
            : TEMPORADAS_POR_DEFECTO
        }))
      )
    );
  }

  obtenerSemillaPorId(id: string): Observable<Semilla> {
    return this.http.get<Semilla>(`${this.urlApi}/${id}`).pipe(
      map(s => ({
        ...s,
        temporadasDisponibles: s.temporadasDisponibles?.length
          ? s.temporadasDisponibles
          : TEMPORADAS_POR_DEFECTO
      }))
    );
  }

  crearSemilla(semilla: Partial<Semilla>): Observable<Semilla> {
    return this.http.post<Semilla>(this.urlApi, semilla);
  }

  actualizarSemilla(id: string, semilla: Partial<Semilla>): Observable<Semilla> {
    return this.http.put<Semilla>(`${this.urlApi}/${id}`, semilla);
  }

  eliminarSemilla(id: string): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/${id}`);
  }

  // Alias de compatibilidad
  getSemillas(): Observable<Semilla[]> {
    return this.obtenerSemillas();
  }

  getSemillaById(id: string): Observable<Semilla> {
    return this.obtenerSemillaPorId(id);
  }

  createSemilla(semilla: Partial<Semilla>): Observable<Semilla> {
    return this.crearSemilla(semilla);
  }

  updateSemilla(id: string, semilla: Partial<Semilla>): Observable<Semilla> {
    return this.actualizarSemilla(id, semilla);
  }

  deleteSemilla(id: string): Observable<void> {
    return this.eliminarSemilla(id);
  }
}
