import { Test, TestingModule } from '@nestjs/testing';
import { ProductoService } from './producto.service';
import { Producto } from '../../domain/entities/producto.entity';
import { LineaService } from 'src/modules/gestion-productos/linea/application/services/linea.service';
import { MarcaService } from 'src/modules/gestion-productos/marca/application/services/marca.service';
import { ProveedorService } from 'src/modules/organizacion/proveedor/application/services/proveedor.service';
import { UsuarioService } from 'src/modules/gestion-usuario/usuario/application/services/usuario.service';
import { ProductoIntrinsicValidationService } from '../../domain/services/producto-intrinsic-validation.service.ts';
import { ProductoValidationService } from '../../domain/services/producto-validation.service.ts';
import { ProductoRelatedEntitiesValidator } from '../../infraestructure/validators/producto-related-entities.validator.ts';
import { ProductoUniquenessValidator } from '../../infraestructure/validators/producto-uniqueness.validator.ts';
import { UsuarioValidator } from 'src/modules/common/utils/validation/usuario-validator';
import { ProductoDeletePolicy } from '../policies/producto-delete.policy';

describe('ProductoService - Orquestación y DDD', () => {
  let service: ProductoService;
  let mockRepository: any;

  beforeEach(async () => {
    // Simulamos el repositorio para no tocar la base de datos real
    mockRepository = {
      findOne: jest.fn(),
      updateEntity: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        { provide: 'IProductoRepository', useValue: mockRepository },
        // Simulamos (Mock) el resto de las dependencias inyectadas en el constructor
        { provide: LineaService, useValue: {} },
        { provide: MarcaService, useValue: {} },
        { provide: ProveedorService, useValue: {} },
        { provide: UsuarioService, useValue: {} },
        { provide: ProductoIntrinsicValidationService, useValue: { validarDatosBasicos: jest.fn() } },
        { provide: ProductoValidationService, useValue: { validarEntidadesRelacionadas: jest.fn() } },
        { 
          provide: ProductoRelatedEntitiesValidator, 
          useValue: { validarYObtenerEntidadesRelacionadas: jest.fn().mockResolvedValue({ marca: {}, linea: {} }) } 
        },
        { provide: ProductoUniquenessValidator, useValue: { validarDenominacionUnica: jest.fn() } },
        { provide: UsuarioValidator, useValue: { validarUsuarioExiste: jest.fn().mockResolvedValue({}) } },
        { provide: ProductoDeletePolicy, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ajustarStockInterno', () => {
    it('debe actuar como orquestador y delegar la regla de negocio a la entidad Producto', async () => {
      // Given: Preparamos un producto simulado y un Unit of Work
      const producto = new Producto();
      producto.stock = 10;
      
      // Espiamos el método de la entidad para confirmar que el servicio realmente lo invoca
      const ajustarStockSpy = jest.spyOn(producto, 'ajustarStock');
      mockRepository.findOne.mockResolvedValue(producto);
      const mockUow = {} as any; 

      // When: Ejecutamos el método del servicio
      await (service as any).ajustarStockInterno(mockUow, 1, -3, 'Venta normal');

      // Then: Verificamos que se cumplió la separación de capas
      expect(mockRepository.findOne).toHaveBeenCalledWith(1); // 1. Recupera la entidad
      expect(ajustarStockSpy).toHaveBeenCalledWith(-3, 'Venta normal'); // 2. Delega al dominio
      expect(mockRepository.updateEntity).toHaveBeenCalledWith(mockUow, producto); // 3. Persiste los cambios
      expect(producto.stock).toBe(7); // Validamos que la entidad mutó su estado
    });
  });

  describe('US-007: Registro histórico de cambios de precio (CR-007)', () => {
    it('debe registrar un nuevo HistorialPrecio cuando el precio del producto cambia', async () => {
      // Given
      const productoExistente = new Producto();
      productoExistente.id = 1;
      productoExistente.marcaId = 1;
      productoExistente.lineaId = 1;
      productoExistente.costo = 1000;
      productoExistente.porcentaje = 50;
      productoExistente.precio = 1500;
      productoExistente.denominacion = 'Producto Test Base';
      productoExistente.denominacionManual = false;
      productoExistente.marca = { id: 1, denominacion: 'Marca Test' } as any;
      productoExistente.linea = { id: 1, denominacion: 'Linea Test' } as any;
      productoExistente.historialPrecios = [];

      mockRepository.findOne.mockResolvedValue(productoExistente);
      mockRepository.updateEntity.mockResolvedValue(productoExistente);
      mockRepository.save.mockResolvedValue(productoExistente);

      jest.spyOn(service as any, 'validarYPrepararActualizacion').mockResolvedValue({
        marca: productoExistente.marca,
        linea: productoExistente.linea,
        usuario: { id: 1 },
      });

      const updateDto = {
        costo: 2000,
        motivo: 'Aumento por lista de proveedor',
      };

      // When
      await service.update(1, updateDto as any);

      // Then
      expect(productoExistente.precio).toBe(3000);
      expect(productoExistente.historialPrecios.length).toBe(1);
      expect(productoExistente.historialPrecios[0].precioAnterior).toBe(1500);
      expect(productoExistente.historialPrecios[0].precioNuevo).toBe(3000);
      expect(productoExistente.historialPrecios[0].motivo).toBe('Aumento por lista de proveedor');
    });

    it('no debe registrar entrada en HistorialPrecio si la actualización no altera el precio', async () => {
      // Given
      const productoExistente = new Producto();
      productoExistente.id = 1;
      productoExistente.marcaId = 1;
      productoExistente.lineaId = 1;
      productoExistente.costo = 1000;
      productoExistente.porcentaje = 50;
      productoExistente.precio = 1500;
      productoExistente.denominacion = 'Producto Test Base';
      productoExistente.denominacionManual = false;
      productoExistente.marca = { id: 1, denominacion: 'Marca Test' } as any;
      productoExistente.linea = { id: 1, denominacion: 'Linea Test' } as any;
      productoExistente.historialPrecios = [];

      mockRepository.findOne.mockResolvedValue(productoExistente);
      mockRepository.updateEntity.mockResolvedValue(productoExistente);
      mockRepository.save.mockResolvedValue(productoExistente);

      jest.spyOn(service as any, 'validarYPrepararActualizacion').mockResolvedValue({
        marca: productoExistente.marca,
        linea: productoExistente.linea,
        usuario: { id: 1 },
      });

      const updateDto = {
        observacion: 'Actualización de notas internas',
      };

      // When
      await service.update(1, updateDto as any);

      // Then
      expect(productoExistente.precio).toBe(1500);
      expect(productoExistente.historialPrecios.length).toBe(0);
    });
  });
});
