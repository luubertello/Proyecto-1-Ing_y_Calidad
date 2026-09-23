import { Producto } from './producto.entity';

describe('Producto - Domain Model (DDD)', () => {
  let producto: Producto;

  beforeEach(() => {
    producto = new Producto();
  });

  describe('Cálculo de Precio (CR-002)', () => {
    it('debe calcular correctamente el precio de venta basado en el costo y el porcentaje de margen', () => {
      // Given
      producto.costo = 1000;
      producto.porcentaje = 50; // 50% de margen

      // When
      producto.calcularPrecio();

      // Then
      expect(producto.precio).toBe(1500);
    });

    it('debe lanzar un error de negocio si el costo o el porcentaje son negativos', () => {
      producto.costo = -100;
      producto.porcentaje = 20;

      expect(() => producto.calcularPrecio()).toThrow();
    });
  });

  describe('Ajuste de Stock y Reglas de Negocio', () => {
    it('debe decrementar el stock correctamente y registrar el motivo', () => {
      // Given
      producto.stock = 20;

      // When
      producto.ajustarStock(-5, 'Venta en mostrador');

      // Then
      expect(producto.stock).toBe(15);
    });

    it('debe impedir stock negativo si la regla de negocio lo prohíbe', () => {
      producto.stock = 2;

      // Intentar descontar más de lo disponible debe lanzar excepción de dominio
      expect(() => producto.ajustarStock(-5, 'Venta excedida')).toThrow();
    });
  });

  describe('Generación de Denominación (CR-005)', () => {
    it('debe generar la denominación automática combinando marca, línea y presentación', () => {
      // When
      producto.generarDenominacion('Coca Cola', 'Retornable', '1.5 Litros');

      // Then
      expect(producto.denominacion).toBe('Coca Cola Retornable 1.5 Litros');
    });

    it('debe respetar la denominación manual si la bandera está activada (CR-005)', () => {
      producto.denominacionManual = true;
      producto.denominacion = 'Nombre Personalizado del Producto';

      // When se intenta generar o actualizar con valores nuevos pero con flag manual en true
      producto.generarDenominacion('Pepsi', 'Descartable', '2 Litros');

      // Then la denominación manual no debe pisarse automáticamente
      expect(producto.denominacion).toBe('Nombre Personalizado del Producto');
    });
  });
});