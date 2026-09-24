import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Matches,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  IsEnum,
  Min,
} from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AlicuotaIva } from 'src/modules/organizacion/enums/alicuota-iva.enum';
import { PresentacionDto } from './presentacion.dto';

export class CreateProductoDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsString({ message: 'La denominación debe ser una cadena de texto.' }) // Valida que sea string
  @IsNotEmpty({ message: 'La denominación no puede estar vacía.' }) // Valida que no esté vacía
  @MaxLength(255, { message: 'La denominación no puede estar vacía.' })
  /*  @Matches(/^[A-Za-z0-9 áéíóúÁÉÍÓÚñÑ.\-/]+$/, {
    message:
      'La denominación solo puede contener letras, números, espacios, puntos, guiones y barras.',
  }) */
  @Matches(/^[\w áéíóúÁÉÍÓÚñÑ.\-/%]+$/, {
    message: 'La denominación contiene caracteres inválidos ',
  })
  denominacion: string;

  @IsOptional()
  @IsString()
  observacion?: string;

  // si no tiene poner vacio
  @IsOptional()
  @IsString()
  codigoProveedor?: string;

  @IsOptional()
  @IsString()
  codigoBarra?: string;

  @IsOptional()
  @IsString()
  codigoReferencia?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsBoolean()
  utilizaStockMinimo: boolean;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'El stock mínimo no puede ser negativo.' })
  stockMinimo?: number;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'El stock no puede ser negativo.' })
  stock?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  costoEnDolar?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  destacado?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  envioGratis?: boolean;

  @IsBoolean()
  @IsOptional()
  denominacionManual?: boolean;  

  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'El costo debe ser mayor a 0.' })
  costo?: number;

  @IsBoolean()
  utilizaPack: boolean;


  @IsOptional()
  @IsInt()
  cantidadPorPack?: number;

  @IsOptional()
  @IsNumber()
  costoDolar?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PresentacionDto)
  presentacion?: PresentacionDto;

  @IsNotEmpty({ message: 'La linea es obligatoria.' })
  @IsInt({ message: 'La linea  debe ser un número entero.' })
  lineaId: number;


  @IsNotEmpty({ message: 'La marca es obligatoria.' })
  @IsInt({ message: 'La marca  debe ser un número entero.' })
  marcaId: number;


  @IsOptional()
  @IsNumber()
  porcentaje?: number;

  /*
  precio nunca se usa; se calcula siempre. 
  @IsOptional()
  @IsNumber()
  precio: number;
  */

  createdAt?: Date;

  @IsEnum(AlicuotaIva, {
    message:
      'tipo debe ser ALICUOTA_0  ALICUOTA_105, ALICUOTA_21, ALICUOTA_27,',
  })
  @Transform(({ value }) => {
    // Si el valor es un string, lo convierte al valor numérico del enum
    if (typeof value === 'string') {
      return AlicuotaIva[value.toUpperCase() as keyof typeof AlicuotaIva];
    }
    return value;
  })
  alicuotaIva: AlicuotaIva;

  @IsNotEmpty({ message: 'El usuarioCreatedId es obligatorio.' })
  @IsInt({ message: 'El usuarioCreatedId debe ser un número entero.' })
  usuarioCreatedId: number;



}
