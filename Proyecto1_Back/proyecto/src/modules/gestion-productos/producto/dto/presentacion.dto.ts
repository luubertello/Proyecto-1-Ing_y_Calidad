
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
export class PresentacionDto {
  @IsNumber()
  @Min(0.01, { message: 'La cantidad de presentación debe ser mayor a 0.' })
  cantidad: number;

  @IsString()
  @IsNotEmpty({ message: 'La unidad de presentación es obligatoria.' })
  unidad: string;
}
