import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, CanActivate } from '@nestjs/common';
import request = require('supertest');
import { ProductoController } from './../src/modules/gestion-productos/producto/application/controllers/producto.controller';
import { ProductoService } from './../src/modules/gestion-productos/producto/application/services/producto.service';
import { AuthGuard } from './../src/modules/gestion-usuario/auth/auth.guard';

// Guard falso para simular la autenticación en las pruebas
const mockAuthGuard: CanActivate = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('Integración de Endpoints - ProductoController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductoController],
      providers: [
        {
          provide: ProductoService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 1 }),
            remove: jest.fn().mockResolvedValue({ message: 'Eliminado con éxito' }), // Mock del método remove
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Valida los DTOs y pipes automáticos
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /producto - debe rechazar con 400 si se intenta crear un producto con campos inválidos', async () => {
    const productoInvalido = {
      costo: -10, // Inválido por regla de dominio
      porcentaje: 20,
      stock: 5,
      utilizaStockMinimo: true,
      utilizaPack: false,
      lineaId: 1,
      marcaId: 1,
      alicuotaIva: 21,
    };

    await request(app.getHttpServer())
      .post('/producto')
      .send(productoInvalido)
      .expect(400);
  });

  it('DELETE /producto/:id - debe permitir eliminar un producto enviando el usuarioId por query', async () => {
    const idProducto = 1;
    const usuarioId = 99; // Requerido por el @Query('usuarioId', ParseIntPipe)

    const response = await request(app.getHttpServer())
      .delete(`/producto/${idProducto}?usuarioId=${usuarioId}`)
      .expect(200);

    expect(response.status).toBe(200);
  });
});