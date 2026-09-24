import { Column } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { UnidadPresentacion } from '../../enums/presentacion.enum';

export class Presentacion {
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cantidad: number;

  @Column({ type: 'enum', enum: UnidadPresentacion, nullable: true })
  unidad: UnidadPresentacion;

  static crear(cantidad: number, unidad: UnidadPresentacion): Presentacion {
    if (cantidad == null || cantidad <= 0) {
      throw new BadRequestException('La cantidad de presentación debe ser mayor a 0.');
    }
    if (!unidad || !Object.values(UnidadPresentacion).includes(unidad)) {
      throw new BadRequestException('La unidad de presentación no es válida.');
    }
    const presentacion = new Presentacion();
    presentacion.cantidad = cantidad;
    presentacion.unidad = unidad;
    return presentacion;
  }

  toString(): string {
    if (this.cantidad == null || !this.unidad) return '';
    return `${this.cantidad}${this.unidad}`;
  }

  equals(otra?: Presentacion): boolean {
    if (!otra) return false;
    return this.cantidad === otra.cantidad && this.unidad === otra.unidad;
  }
}