import { Producto } from './producto.entity';
import { Presentacion } from '../value-objects/presentacion.vo';
import { UnidadPresentacion } from '../../enums/presentacion.enum';

describe('Producto - Aggregate Root y Reglas de Dominio', () => {
  let producto: Producto;

  beforeEach(() => {
    producto = new Producto();
  });

  describe('US-001: Validación estricta de datos de producto (CR-001)', () => {
    it('debe calcular el precio correctamente aplicando costo + margen y persistir precio > 0', () => {
      // Regla: El precio siempre deriva de costo + margen
      producto.costo = 1000;
      producto.porcentaje = 50; // Margen del 50%

      producto.calcularPrecio();

      expect(producto.precio).toBe(1500);
      expect(producto.precio).toBeGreaterThan(0);
    });

    it('debe rechazar la operación si el costo es menor o igual a cero', () => {
      // Regla: El costo debe ser mayor a 0
      producto.costo = 0;
      producto.porcentaje = 20;

      expect(() => producto.calcularPrecio()).toThrow('El costo debe ser mayor a 0');
    });

    it('debe rechazar la operación si el margen de ganancia es negativo', () => {
      // Regla: El margen no puede ser negativo
      producto.costo = 500;
      producto.porcentaje = -10;

      expect(() => producto.calcularPrecio()).toThrow('El margen no puede ser negativo');
    });

    it('debe impedir que el stock quede en negativo ante un ajuste', () => {
      // Regla: El stock no puede ser negativo
      producto.stock = 5;

      expect(() => producto.ajustarStock(-10, 'Venta')).toThrow('El stock no puede ser negativo');
    });

    it('debe actualizar el stock y entrar en alerta si stockActual <= stockMinimo', () => {
      // Regla Event Storming: StockBajoDetectado si stockActual <= stockMinimo
      producto.stock = 10;
      producto.stockMinimo = 5;
      producto.utilizaStockMinimo = true;

      producto.ajustarStock(-6, 'Venta regular');

      expect(producto.stock).toBe(4);
      expect(producto.estaBajoMinimo()).toBe(true);
    });
  });

  describe('US-002: Gestión de la presentación del producto (CR-002)', () => {
    it('debe asignar una presentación válida al producto mediante el Value Object', () => {
      // Regla: La presentación se modela como Value Object con cantidad y unidad
      const presentacion = Presentacion.crear(1.5, UnidadPresentacion.LITROS);
      producto.presentacion = presentacion;

      expect(producto.presentacion.cantidad).toBe(1.5);
      expect(producto.presentacion.unidad).toBe(UnidadPresentacion.LITROS);
    });
  });

  describe('US-005: Generación automática de la denominación (CR-005)', () => {
    it('debe autogenerar denominación como Marca + Línea + Presentación si no fue editada manualmente', () => {
      // Regla: Marca + Línea + Presentación cuando denominacionManual es false
      producto.denominacionManual = false;
      
      const presentacion = Presentacion.crear(2, UnidadPresentacion.LITROS); 
      producto.generarDenominacion('Coca-Cola', 'Gaseosas', presentacion);

      expect(producto.denominacion).toBe('Coca-Cola Gaseosas 2L');
    });

    it('debe respetar y no sobrescribir la denominación si fue editada manualmente por el usuario', () => {
      // Regla: Política de indicador de denominación manual para proteger el texto del usuario
      producto.denominacionManual = true;
      producto.denominacion = 'Edición Personalizada por Usuario';

      const presentacion = Presentacion.crear(1.5, UnidadPresentacion.LITROS);
      producto.generarDenominacion('Pepsi', 'Gaseosas', presentacion);;

      expect(producto.denominacion).toBe('Edición Personalizada por Usuario');
    });
  });
});