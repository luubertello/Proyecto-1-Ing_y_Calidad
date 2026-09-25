export interface SuperLinea {
  id: number;
  denominacion: string;
  observacion?: string | null;
  sistema: number;
  deletedAt?: string | null;
}

export interface SelectSuperLinea {
  id: number;
  denominacion: string;
}