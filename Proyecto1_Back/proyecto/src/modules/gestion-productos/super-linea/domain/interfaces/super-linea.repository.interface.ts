import { SuperLinea } from '../entities/super-linea.entity';
import { CreateSuperLineaDto } from '../../dto/create-super-linea.dto';
import { UpdateSuperLineaDto } from '../../dto/update-super-linea.dto';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { AuditoriaDto } from 'src/modules/gestion-sistema/auditoria/dto/auditoria.dto';

export interface ISuperLineaRepository {
  create(data: CreateSuperLineaDto): Promise<SuperLinea>;
  update(id: number, data: UpdateSuperLineaDto): Promise<SuperLinea>;
  findByDenominacionFiltered(
    denominacion: string,
    skip: number,
    take: number,
    incluirEliminados: boolean,
  ): Promise<{ data: SuperLinea[]; total: number }>;
  findAllFor(denominacion: string): Promise<SuperLinea[]>;
  findOne(id: number): Promise<SuperLinea | null>;
  findByDenominacionWith(denominacion: string): Promise<SuperLinea | null>;
  remove(data: SuperLinea, usuario: Usuario): Promise<SuperLinea>;
  findByIdConAuditoria(id: number): Promise<AuditoriaDto | null>;
  findAllListado(): Promise<SuperLinea[]>;
}