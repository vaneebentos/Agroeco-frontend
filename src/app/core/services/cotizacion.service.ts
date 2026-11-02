import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem, CotizacionPayload, ProducerFormData } from '../../shared/models/cotizacion.model';
import { Semilla } from '../../shared/models/semilla.model';

const TEMPORADAS_DEFAULT = ['2025/26 Temprana', '2025/26 Tardía'];

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
  private apiUrl = 'http://localhost:3000/cotizacion';
  private storageKey = 'agroeco_cotizacion_cart';

  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());

  readonly items = this.cartItems.asReadonly();

  readonly totalHectareas = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + (Number(item.hectareas) || 0), 0);
  });

  readonly count = computed(() => {
    return this.cartItems().length;
  });

  constructor(private http: HttpClient) {}

  addItem(semilla: Semilla, hectareas: number = 50, temporada?: string) {
    const temporadas =
      semilla.temporadasDisponibles && semilla.temporadasDisponibles.length >= 2
        ? semilla.temporadasDisponibles
        : TEMPORADAS_DEFAULT;

    const semillaConTemporadas: Semilla = {
      ...semilla,
      temporadasDisponibles: temporadas
    };

    const current = this.cartItems();
    const existingIndex = current.findIndex(i => i.semillaId === Number(semillaConTemporadas.id));
    const selectedTemporada = temporada || temporadas[0] || '2025/26 Temprana';

    if (existingIndex > -1) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        semilla: semillaConTemporadas,
        hectareas: updated[existingIndex].hectareas + hectareas,
        temporada: selectedTemporada
      };
      this.saveCart(updated);
    } else {
      const newItem: CartItem = {
        semillaId: Number(semillaConTemporadas.id),
        semilla: semillaConTemporadas,
        hectareas: hectareas,
        temporada: selectedTemporada
      };
      this.saveCart([...current, newItem]);
    }
  }

  updateItem(semillaId: number, hectareas: number, temporada: string) {
    const updated = this.cartItems().map(item => {
      if (item.semillaId === semillaId) {
        return { ...item, hectareas: Math.max(1, Number(hectareas) || 1), temporada };
      }
      return item;
    });
    this.saveCart(updated);
  }

  removeItem(semillaId: number) {
    const updated = this.cartItems().filter(i => i.semillaId !== semillaId);
    this.saveCart(updated);
  }

  clearCart() {
    this.saveCart([]);
  }

  enviarCotizacion(formData: ProducerFormData): Observable<any> {
    const semillasPayload = this.cartItems().map(item => ({
      semilla_id: item.semillaId,
      cantidad: item.hectareas,
      nombre: item.semilla?.nombre,
      cultivo: item.semilla?.cultivo,
      temporada: item.temporada
    }));

    const observacionesGeneradas = `Establecimiento: ${formData.establecimiento || 'No especificado'} | Localidad: ${formData.localidadZona || 'No especificado'}. Comentarios: ${formData.comentarios || 'Sin comentarios adicionales.'}`;

    const payload: CotizacionPayload = {
      nombre_cliente: formData.nombreApellido,
      cuit: formData.cuit ? formData.cuit.trim() : undefined,
      email_cliente: formData.correo,
      telefono: formData.telefono,
      observaciones: observacionesGeneradas,
      semillas: semillasPayload
    };

    return this.http.post(this.apiUrl, payload);
  }

  private saveCart(items: CartItem[]) {
    this.cartItems.set(items);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e);
    }
  }

  private loadCartFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed: CartItem[] = JSON.parse(data);
        return parsed.map(item => ({
          ...item,
          semilla: {
            ...item.semilla,
            temporadasDisponibles:
              item.semilla?.temporadasDisponibles && item.semilla.temporadasDisponibles.length >= 2
                ? item.semilla.temporadasDisponibles
                : TEMPORADAS_DEFAULT
          }
        }));
      }
    } catch (e) {
      console.warn('Error leyendo carrito de localStorage', e);
    }
    return [
      // Elementos iniciales de demostración como en el prototipo si está vacío
      {
        semillaId: 1,
        semilla: {
          id: 1,
          nombre: 'LG 30646',
          cultivo: 'Maíz',
          tipo: 'Híbrido',
          nuevo: true,
          descripcion: 'Estabilidad y potencial en todos los ambientes.',
          ciclo: 'Intermedio',
          madurezRelativa: 120,
          densidad: '70.000 - 80.000 pl/ha',
          tecnologia: 'VIP3',
          ambiente: 'Alto potencial, Intermedio',
          zonasAdaptacion: ['Núcleo'],
          temporadasDisponibles: TEMPORADAS_DEFAULT
        },
        hectareas: 50,
        temporada: '2025/26 Temprana'
      }
    ];
  }
}

