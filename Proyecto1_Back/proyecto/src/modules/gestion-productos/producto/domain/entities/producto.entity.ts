import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Linea } from '../../../linea/domain/entities/linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { AlicuotaIva } from 'src/modules/organizacion/enums/alicuota-iva.enum';
import { ApiProperty } from '@nestjs/swagger';
import { ProductoOperacion } from '../../../producto-operacion/entities/producto-operacion.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { MonetarioColumn } from 'src/modules/common/decorators/monetario-column.decorator';
import { CantidadColumn } from 'src/modules/common/decorators/cantidad-column.decorator';
import { PorcentajeColumn } from 'src/modules/common/decorators/porcentaje-column.decorator';
import { Proveedor } from 'src/modules/organizacion/proveedor/domain/entities/proveedor.entity';
import { BadRequestException } from '@nestjs/common';
import { Presentacion } from '../value-objects/presentacion.vo';
import { HistorialPrecio } from 'src/modules/gestion-productos/historial-precios/domain/entities/historial-precios.entity';
import { MovimientoStock } from 'src/modules/gestion-productos/movimiento-stock/domain/entities/movimiento-stock.entity';


@Entity('producto')
export class Producto {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'text' })
  denominacion: string;

  //Nuevo campo agregado para cumplir con CR-005
  @Column('boolean', { default: false })
  denominacionManual: boolean;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  codigoProveedor?: string | null;

  @Column({ type: 'text', nullable: true })
  codigoBarra?: string | null;

  @Column(() => Presentacion)
  presentacion?: Presentacion;

  // ========== PROVEEDOR ==========
  @ManyToOne(() => Proveedor, (pro) => pro.proveedoresOperacion, {
    eager: true,
  })
  @JoinColumn({ name: 'proveedor_id' })
  @Index()
  proveedor: Proveedor;

  @Column({ type: 'int', nullable: true })
  proveedorId?: number;

  /*
  Nota: No usar el enum alciculta iva en @Column
        sino no anda el importar precios 
  */
  @PorcentajeColumn(21.0)
  alicuotaIva: AlicuotaIva;

  // Stock: cantidades reales, admite fracciones (1.5 kg, 0.25 lts)
  @CantidadColumn()
  stock: number;

  @Column('boolean', { default: false })
  utilizaStockMinimo: boolean;

  @Column('boolean', { default: false })
  utilizaStockMinimoPorEmpresa: boolean;

  @CantidadColumn()
  stockMinimo: number;

  @MonetarioColumn()
  costo?: number;

  @MonetarioColumn()
  costoDolar?: number;

  /*
  Ultima cotizacion dolar por el cambio de precio si producto posee costo dolar, se puede sacarrr
  */
  @MonetarioColumn()
  cotizacionDolar?: number;
  //se utiliza en las importaciones;

  @MonetarioColumn()
  precioDolar?: number;
  // Precio de venta

  @MonetarioColumn()
  precio?: number;

  // por default es 15% el porcentaje segun el dominio
  @PorcentajeColumn(15.0)
  porcentaje?: number;

  @Column({ type: 'timestamp', nullable: true })
  fechaCosto?: Date;

  @Column('boolean', { default: false })
  costoEnDolar?: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaCostoDolar?: Date;


  @Column('boolean', { default: false })
  destacado?: boolean;

  @Column('boolean', { default: false })
  envioGratis?: boolean;

  @Column({ type: 'text', nullable: true })
  observacion?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  deletedAt?: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_created_id' })
  usuarioCreated: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_updated_id' })
  usuarioUpdated: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_deleted_id' })
  usuarioDeleted: Usuario;


  // ========== LINEA ==========
  @ManyToOne(() => Linea, (linea) => linea.productos)
  @JoinColumn({ name: 'linea_id' })
  linea: Linea;

  @Column({ type: 'int', nullable: true })
  lineaId?: number;


 // ==========  MARCA ==========
  @ManyToOne(() => Marca, (marca) => marca.productos)
  @JoinColumn({ name: 'marca_id' })
  marca: Marca;

  @Column({ type: 'int', nullable: true })
  marcaId?: number;


  @Column({ default: false })
  utilizaPack: boolean;

  @Column({ type: 'int', nullable: true })
  cantidadPorPack: number | null;

  @Column({ type: 'text', nullable: true })
  imagen?: string;


  @Column({ type: 'text', nullable: true })
  ubicacion?: string;

  @ManyToOne(() => Producto, (producto) => producto.productosOperacion)
  productosOperacion: ProductoOperacion;


  @Column({ type: 'int', default: 0 })
  sistema: number;

  @Column({ type: 'text', nullable: true })
  codigoReferencia?: string | null;

  @OneToMany(() => HistorialPrecio, (historial) => historial.producto, {
    cascade: true,
  })
  historialPrecios: HistorialPrecio[];

  @OneToMany(() => MovimientoStock, (movimiento) => movimiento.producto, {
  cascade: true,
  })
  movimientosStock: MovimientoStock[];


  //Comportamientos del dominio DDD//
 public calcularPrecio(): void {
    if (this.costo == null || this.porcentaje == null) return;
    
      if (this.costo <= 0) {
    throw new BadRequestException('El costo debe ser mayor a 0.');
  }
  if (this.porcentaje < 0) {
    throw new BadRequestException('El margen no puede ser negativo.');
  }

    this.precio = this.costo + (this.costo * (this.porcentaje / 100));
  }

  public generarDenominacion(nombreMarca: string, nombreLinea: string, presentacion?: Presentacion): void {
  if (!this.denominacionManual) {
    const presentacionStr = presentacion?.toString() ?? '';
    this.denominacion = `${nombreMarca} ${nombreLinea} ${presentacionStr}`.trim();
  }
}

  public ajustarStock(cantidadModificar: number, motivo: string): void {
    if (!motivo || motivo.trim() === '') {
      throw new BadRequestException('El motivo es obligatorio.');
    }
    
    const nuevoStock = this.stock + cantidadModificar;
    if (nuevoStock < 0) {
      throw new BadRequestException('El stock no puede ser negativo.');
    }
    
    this.stock = nuevoStock;
  }

  public estaBajoMinimo(): boolean {
    if (!this.utilizaStockMinimo) return false;
    return this.stock <= this.stockMinimo;
  }
}
