import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum TipoModificacion {
  COSTO = 'COSTO',
  MARGEN = 'MARGEN',
}

export enum TipoCalculo {
  PORCENTAJE = 'PORCENTAJE',
  MONTO = 'MONTO',
}

export class UpdatePrecioMasivoDto {
  @IsEnum(TipoModificacion)
  tipoModificacion: TipoModificacion;

  @IsEnum(TipoCalculo)
  tipoCalculo: TipoCalculo;

  @IsNumber()
  @Min(0.01)
  valor: number;

  @IsString()
  motivo: string;

  @IsNumber()
  usuarioId: number;

  // Filtros opcionales
  @IsOptional()
  @IsNumber()
  lineaId?: number; 
  
  @IsOptional()
  @IsNumber()
  marcaId?: number; 
  
  @IsOptional()
  @IsNumber()
  proveedorId?: number; 
}