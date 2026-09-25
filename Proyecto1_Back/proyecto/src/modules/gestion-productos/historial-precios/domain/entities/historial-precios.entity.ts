import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from 'src/modules/gestion-productos/producto/domain/entities/producto.entity';
import { MonetarioColumn } from 'src/modules/common/decorators/monetario-column.decorator';

@Entity('historial_precio')
export class HistorialPrecio {
  @PrimaryGeneratedColumn()
  id: number;

  @MonetarioColumn()
  precioAnterior: number;

  @MonetarioColumn()
  precioNuevo: number;

  @Column({ type: 'text' })
  motivo: string;

  // TypeORM asigna la fecha automáticamente al hacer el INSERT
  @CreateDateColumn()
  fecha: Date;

  @ManyToOne(() => Producto, (producto) => producto.historialPrecios, {
    onDelete: 'CASCADE', 
  })
  
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'int' })
  productoId: number;
}