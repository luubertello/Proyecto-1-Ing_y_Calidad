import { PartialType } from '@nestjs/mapped-types';
import { CreateLineaDto } from './create-linea.dto';
import { IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class UpdateLineaDto extends PartialType(CreateLineaDto) {

    @IsNotEmpty({ message: 'La superlínea es obligatoria.' })
    @IsInt({ message: 'La superlíneaId debe ser un número entero.' })
    superLineaId?: number;

    @IsBoolean()
    utilizaStockMinimo: boolean;

    updatedAt: Date;

    @IsNotEmpty({ message: 'El usuarioCreatedId es obligatorio.' })
    @IsInt({ message: 'El usuarioCreatedId debe ser un número entero.' })
    usuarioUpdatedId: number;
}
