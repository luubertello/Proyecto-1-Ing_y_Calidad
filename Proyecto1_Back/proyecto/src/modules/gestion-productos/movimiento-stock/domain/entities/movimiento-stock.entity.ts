import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from 'src/modules/gestion-productos/producto/domain/entities/producto.entity';
import { CantidadColumn } from 'src/modules/common/decorators/cantidad-column.decorator';

export enum TipoMovimientoStock {
  AJUSTE_MANUAL = 'AJUSTE_MANUAL',
  COMPRA = 'COMPRA',
  VENTA = 'VENTA',
  DEVOLUCION_CLIENTE = 'DEVOLUCION_CLIENTE',
  DEVOLUCION_PROVEEDOR = 'DEVOLUCION_PROVEEDOR',
}

@Entity('movimiento_stock')
export class MovimientoStock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TipoMovimientoStock, default: TipoMovimientoStock.AJUSTE_MANUAL })
  tipoMovimiento: TipoMovimientoStock;

  @CantidadColumn()
  cantidad: number;

  @Column({ type: 'text' })
  motivo: string;

  @CreateDateColumn()
  fecha: Date;

  @ManyToOne(() => Producto, (producto) => producto.movimientosStock, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column({ name: 'productoId', type: 'int' })
  productoId: number;
}