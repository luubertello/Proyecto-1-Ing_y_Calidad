import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SuperLinea } from './domain/entities/super-linea.entity';
import { SuperLineaPersistenceAdapter } from './infraestructure/repositories/super-linea.persistence-adapter';
import { NormalizeDenominacionPipe } from 'src/modules/common/pipes/normalize-denominations.pipe';
import { IUnitOfWork } from 'src/modules/common/unit-of-work/iunit-of-work.';
import { TypeOrmUnitOfWork } from 'src/modules/common/unit-of-work/type-orm-unit-of-works1';
import { UsuarioModule } from 'src/modules/gestion-usuario/usuario/usuario.module';
import { SuperLineaController } from './application/controllers/super-linea.controller';
import { SuperLineaService } from './application/services/super-linea.service';
import { PoliticaEliminacionSuperLinea } from './domain/services/politica-eliminacion-super-linea.service';
import { LineaModule } from '../linea/linea.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperLinea]),
    forwardRef(() => LineaModule),
    UsuarioModule,
  ],
  controllers: [SuperLineaController],
  providers: [
    SuperLineaService,
    PoliticaEliminacionSuperLinea,
    {
      provide: 'ISuperLineaRepository',
      useClass: SuperLineaPersistenceAdapter,
    },
    {
      provide: 'UnitOfWork',
      useFactory: (dataSource: DataSource): IUnitOfWork => new TypeOrmUnitOfWork(dataSource),
      inject: [DataSource],
    },
    NormalizeDenominacionPipe,
  ],
  exports: [TypeOrmModule, SuperLineaService, 'ISuperLineaRepository'],
})
export class SuperLineaModule {}