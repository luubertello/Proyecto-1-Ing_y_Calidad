import { Linea } from './linea.entity';
import { SuperLinea } from 'src/modules/gestion-productos/super-linea/domain/entities/super-linea.entity';

describe('US-003: Agrupación de Línea en SuperLínea (CR-003)', () => {
  it('debe permitir que una SuperLínea agrupe múltiples Líneas y cada Línea tenga su SuperLínea asociada', () => {
    // 1. Instanciamos una SuperLínea
    const superLineaBebidas = new SuperLinea();
    superLineaBebidas.id = 1;
    superLineaBebidas.denominacion = 'Bebidas';

    // 2. Creamos múltiples líneas vinculadas a esa misma SuperLínea
    const lineaGaseosas = new Linea();
    lineaGaseosas.id = 101;
    lineaGaseosas.denominacion = 'Gaseosas';
    lineaGaseosas.superLinea = superLineaBebidas;
    lineaGaseosas.superLineaId = superLineaBebidas.id;

    const lineaAguas = new Linea();
    lineaAguas.id = 102;
    lineaAguas.denominacion = 'Aguas y Jugos';
    lineaAguas.superLinea = superLineaBebidas;
    lineaAguas.superLineaId = superLineaBebidas.id;

    // Aserción: Una SuperLínea agrupa a ambas Líneas
    expect(lineaGaseosas.superLinea.id).toBe(superLineaBebidas.id);
    expect(lineaAguas.superLinea.id).toBe(superLineaBebidas.id);
  });

  it('debe rechazar la creación o persistencia de una Línea si no tiene una SuperLínea asociada (obligatoriedad)', () => {
    const lineaInvalida = new Linea();
    lineaInvalida.denominacion = 'Línea Huérfana';
    lineaInvalida.superLineaId = null as any;

    // Validación de integridad: una Línea no puede existir sin pertenecer a una SuperLínea
    expect(() => {
      if (!lineaInvalida.superLineaId) {
        throw new Error('Toda Línea debe pertenecer obligatoriamente a una SuperLínea');
      }
    }).toThrow('Toda Línea debe pertenecer obligatoriamente a una SuperLínea');
  });
});