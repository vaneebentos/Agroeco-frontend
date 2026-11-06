import { Seed } from './seed.model';

export interface CartItem {
  seedId: number;
  seed: Seed;
  hectares: number;
  season: string;
}

/** Seed line of a quote, as exchanged with the backend. */
export interface QuoteSeed {
  seedId: number;
  quantity: number;
  name?: string;
  crop?: string;
  season?: string;
}

/** Body of `POST /quotes`. */
export interface QuotePayload {
  customerName: string;
  cuit?: string;
  customerEmail: string;
  phone: string;
  notes: string;
  seeds: QuoteSeed[];
}

/** Quote returned by the backend. */
export interface Quote {
  id: number;
  customerName: string;
  cuit?: string | null;
  customerEmail: string;
  phone: string | null;
  requestDate: string;
  status: string;
  notes: string | null;
  seeds?: QuoteSeed[];
}

export interface ProducerFormData {
  fullName: string;
  cuit: string;
  farm: string;
  locality: string;
  phone: string;
  email: string;
  comments: string;
}
