import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AjustarStockDto {
  @ApiProperty({ example: -5, description: 'Cantidad a sumar (positivo) o restar (negativo) del stock actual' })
  @IsInt()
  cantidad: number;

  @ApiProperty({ example: 'Rotura de mercadería', description: 'Motivo del ajuste (obligatorio)' })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  usuarioId: number;
}