export type TipoCiclo = 'Corto' | 'Medio' | 'Largo';

export interface SanidadItem {
  nombre: string;
  puntos: number;
}

export type ItemSanidad = SanidadItem;

export interface Semilla {
  id: number | string;
  codigo?: string;
  nombre: string;
  cultivo?: string;
  cultivo_id?: number;
  tipo?: string;
  categoria?: 'PRIMERA' | 'SEGUNDA';
  nuevo?: boolean;
  descripcion?: string;
  caracteristicas?: string;
  ciclo?: string;
  cruzamiento?: string | null;
  madurezRelativa?: number | string;
  madurez_relativa?: string | null;
  diasFloracion?: string;
  dias_floracion?: string | null;
  densidad?: string;
  tecnologia?: string | null;
  ambiente?: string;
  colorGrano?: string;
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
  precio?: number;
  stock?: number;
  unidad_stock?: string;
  rendimiento_estimado?: number;
  unidad_rendimiento?: string;
  activo?: boolean;
  eliminado?: boolean;
}

export interface FilterState {
  search: string;
  cultivo: string;
  soloHibridos: boolean;
  temporada: string;
  zona: string;
}
