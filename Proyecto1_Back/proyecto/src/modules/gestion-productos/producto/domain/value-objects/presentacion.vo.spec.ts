import { Presentacion } from './presentacion.vo';
import { UnidadPresentacion } from '../../enums/presentacion.enum';

describe('US-002: Gestión de la presentación del producto (CR-002)', () => {
  it('debe crear un Value Object Presentación válido con cantidad y unidad permitida', () => {
    const presentacion = Presentacion.crear(1.5, UnidadPresentacion.LITROS);

    expect(presentacion.cantidad).toBe(1.5);
    expect(presentacion.unidad).toBe(UnidadPresentacion.LITROS);
  });

  it('debe arrojar error si la cantidad es menor o igual a cero', () => {
    expect(() => Presentacion.crear(0, UnidadPresentacion.LITROS)).toThrow();
    expect(() => Presentacion.crear(-2, UnidadPresentacion.KILOGRAMOS)).toThrow();
  });
});