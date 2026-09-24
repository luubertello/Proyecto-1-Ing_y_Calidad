import { Column } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

export class Presentacion {
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cantidad: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unidad: string;

  
  static crear(cantidad: number, unidad: string): Presentacion {
    if (cantidad == null || cantidad <= 0) {
      throw new BadRequestException('La cantidad de presentación debe ser mayor a 0.');
    }
    if (!unidad || unidad.trim() === '') {
      throw new BadRequestException('La unidad de presentación es obligatoria.');
    }
    const presentacion = new Presentacion();
    presentacion.cantidad = cantidad;
    presentacion.unidad = unidad.trim();
    return presentacion;
  }

  toString(): string {
    if (this.cantidad == null || !this.unidad) return '';
    return `${this.cantidad}${this.unidad}`; // ej: "2L", "1pack"
  }

  equals(otra?: Presentacion): boolean {
    if (!otra) return false;
    return this.cantidad === otra.cantidad && this.unidad === otra.unidad;
  }
}