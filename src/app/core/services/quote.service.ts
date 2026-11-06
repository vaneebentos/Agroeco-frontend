import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem, ProducerFormData, Quote, QuotePayload } from '../../shared/models/quote.model';
import { Seed } from '../../shared/models/seed.model';

const DEFAULT_SEASONS = ['2025/26 Temprana', '2025/26 Tardía'];

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private apiUrl = 'http://localhost:3000/quotes';
  private storageKey = 'agroeco_cotizacion_cart';

  private cartItems = signal<CartItem[]>(this.loadCartFromStorage());

  readonly items = this.cartItems.asReadonly();

  readonly totalHectares = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + (Number(item.hectares) || 0), 0);
  });

  readonly count = computed(() => {
    return this.cartItems().length;
  });

  constructor(private http: HttpClient) {}

  addItem(seed: Seed, hectares: number = 50, season?: string) {
    const seasons =
      seed.availableSeasons && seed.availableSeasons.length >= 2
        ? seed.availableSeasons
        : DEFAULT_SEASONS;

    const seedWithSeasons: Seed = {
      ...seed,
      availableSeasons: seasons
    };

    const current = this.cartItems();
    const existingIndex = current.findIndex(i => i.seedId === Number(seedWithSeasons.id));
    const selectedSeason = season || seasons[0] || '2025/26 Temprana';

    if (existingIndex > -1) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        seed: seedWithSeasons,
        hectares: updated[existingIndex].hectares + hectares,
        season: selectedSeason
      };
      this.saveCart(updated);
    } else {
      const newItem: CartItem = {
        seedId: Number(seedWithSeasons.id),
        seed: seedWithSeasons,
        hectares: hectares,
        season: selectedSeason
      };
      this.saveCart([...current, newItem]);
    }
  }

  updateItem(seedId: number, hectares: number, season: string) {
    const updated = this.cartItems().map(item => {
      if (item.seedId === seedId) {
        return { ...item, hectares: Math.max(1, Number(hectares) || 1), season };
      }
      return item;
    });
    this.saveCart(updated);
  }

  removeItem(seedId: number) {
    const updated = this.cartItems().filter(i => i.seedId !== seedId);
    this.saveCart(updated);
  }

  clearCart() {
    this.saveCart([]);
  }

  /** Sends the quote request to the backend (`POST /quotes`). */
  submitQuote(formData: ProducerFormData): Observable<Quote> {
    const seedsPayload = this.cartItems().map(item => ({
      seedId: item.seedId,
      quantity: item.hectares,
      name: item.seed?.name,
      crop: item.seed?.crop,
      season: item.season
    }));

    const generatedNotes = `Establecimiento: ${formData.farm || 'No especificado'} | Localidad: ${formData.locality || 'No especificado'}. Comentarios: ${formData.comments || 'Sin comentarios adicionales.'}`;

    const payload: QuotePayload = {
      customerName: formData.fullName,
      cuit: formData.cuit ? formData.cuit.trim() : undefined,
      customerEmail: formData.email,
      phone: formData.phone,
      notes: generatedNotes,
      seeds: seedsPayload
    };

    return this.http.post<Quote>(this.apiUrl, payload);
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
        // Carts stored by previous versions used other property names; discard them.
        if (Array.isArray(parsed) && parsed.every(item => item && item.seedId !== undefined && item.seed)) {
          return parsed.map(item => ({
            ...item,
            seed: {
              ...item.seed,
              availableSeasons:
                item.seed?.availableSeasons && item.seed.availableSeasons.length >= 2
                  ? item.seed.availableSeasons
                  : DEFAULT_SEASONS
            }
          }));
        }
      }
    } catch (e) {
      console.warn('Error leyendo carrito de localStorage', e);
    }
    return [
      // Initial demo items, as in the prototype, when the cart is empty
      {
        seedId: 1,
        seed: {
          id: 1,
          name: 'LG 30646',
          crop: 'Maíz',
          type: 'Híbrido',
          isNew: true,
          description: 'Estabilidad y potencial en todos los ambientes.',
          cycle: 'Intermedio',
          relativeMaturity: 120,
          density: '70.000 - 80.000 pl/ha',
          technology: 'VIP3',
          environment: 'Alto potencial, Intermedio',
          adaptationZones: ['Núcleo'],
          availableSeasons: DEFAULT_SEASONS
        },
        hectares: 50,
        season: '2025/26 Temprana'
      }
    ];
  }
}
