
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { UnidadPresentacion } from '../enums/presentacion.enum';

export class PresentacionDto {
  @IsNumber()
  @Min(0.01, { message: 'La cantidad de presentación debe ser mayor a 0.' })
  cantidad: number;

  @IsEnum(UnidadPresentacion, { message: 'La unidad de presentación no es válida.' })
  unidad: UnidadPresentacion;
}
