export type TipoCiclo = 'Corto' | 'Medio' | 'Largo';

export interface SanidadItem {
  nombre: string;
  puntos: number;
}

export interface Semilla {
  id: number | string;
  codigo?: string;
  nombre: string;
  cultivo?: 'Maíz' | 'Girasol' | 'Soja' | 'Trigo' | 'Pastura' | string;
  cultivo_id?: number;
  tipo?: 'Híbrido' | 'Variedad' | 'HIBRIDA' | 'COMUN' | string;
  categoria?: 'PRIMERA' | 'SEGUNDA' | string;
  nuevo?: boolean;
  descripcion?: string | null;
  ciclo?: TipoCiclo | string;
  madurezRelativa?: number | string;
  madurez_relativa?: string | null;
  densidad?: string;
  tecnologia?: string | null;
  ambiente?: string;
  diasFloracion?: number;
  dias_floracion?: string | null;
  cruzamiento?: string | null;
  tipoColorGrano?: string;
  color_grano?: string | null;
  alturaPlanta?: string;
  altura_planta?: string | null;
  numeroHileras?: string;
  numero_hileras?: string | null;
  sanidad?: SanidadItem[] | null;
  comportamientoSanitario?: {
    [key: string]: number;
  };
  zonasAdaptacion?: string[];
  temporadasDisponibles?: string[];
  informeIntaUrl?: string;
  caracteristicas?: string | null;
  stock?: number;
  unidad_stock?: string;
  rendimiento_estimado?: number;
  unidad_rendimiento?: string;
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
