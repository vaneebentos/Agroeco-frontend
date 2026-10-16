export interface Seed {
  id: number;
  nombre: string;
  cultivo: 'Maíz' | 'Girasol' | 'Soja' | 'Trigo' | 'Pastura' | string;
  tipo: 'Híbrido' | 'Variedad' | string;
  nuevo?: boolean;
  descripcion: string;
  ciclo: string;
  madurezRelativa?: number | string;
  densidad: string;
  tecnologia: string;
  ambiente: string;
  diasFloracion?: number;
  cruzamiento?: string;
  tipoColorGrano?: string;
  alturaPlanta?: string;
  numeroHileras?: string;
  comportamientoSanitario?: {
    [key: string]: number;
  };
  zonasAdaptacion: string[];
  temporadasDisponibles: string[];
  informeIntaUrl?: string;
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
