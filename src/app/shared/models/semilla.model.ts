export type TipoCiclo = 'Corto' | 'Medio' | 'Largo';

export interface Semilla {
  id: number | string;
  nombre: string;
  cultivo?: 'Maíz' | 'Girasol' | 'Soja' | 'Trigo' | 'Pastura' | string;
  cultivo_id?: number;
  tipo?: 'Híbrido' | 'Variedad' | string;
  nuevo?: boolean;
  descripcion?: string;
  ciclo?: TipoCiclo | string;
  madurezRelativa?: number | string;
  densidad?: string;
  tecnologia?: string;
  ambiente?: string;
  diasFloracion?: number;
  cruzamiento?: string;
  tipoColorGrano?: string;
  alturaPlanta?: string;
  numeroHileras?: string;
  comportamientoSanitario?: {
    [key: string]: number;
  };
  zonasAdaptacion?: string[];
  temporadasDisponibles?: string[];
  informeIntaUrl?: string;
  caracteristicas?: string | null;
  activo?: boolean;
}

export interface FilterState {
  search: string;
  cultivo: string;
  soloHibridos: boolean;
  temporada: string;
  ambiente: string;
  tecnologia: string;
  zona: string;
}
