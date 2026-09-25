import { PoliticaEliminacionSuperLinea } from './politica-eliminacion-super-linea.service';

describe('US-003: PoliticaEliminacionSuperLinea (CR-003)', () => {
  let politica: PoliticaEliminacionSuperLinea;
  let mockLineaRepository: any;

  beforeEach(() => {
    mockLineaRepository = {
      existsLineasActivasBySuperLinea: jest.fn(),
    };
    politica = new PoliticaEliminacionSuperLinea(mockLineaRepository);
  });

  it('debe retornar true si existen líneas activas asociadas a la SuperLínea', async () => {
    // Given
    mockLineaRepository.existsLineasActivasBySuperLinea.mockResolvedValue(true);

    // When
    const resultado = await politica.tieneLineasActivasParaSuperLinea(1);

    // Then
    expect(mockLineaRepository.existsLineasActivasBySuperLinea).toHaveBeenCalledWith(1);
    expect(resultado).toBe(true);
  });

  it('debe retornar false si no existen líneas activas asociadas a la SuperLínea', async () => {
    // Given
    mockLineaRepository.existsLineasActivasBySuperLinea.mockResolvedValue(false);

    // When
    const resultado = await politica.tieneLineasActivasParaSuperLinea(1);

    // Then
    expect(mockLineaRepository.existsLineasActivasBySuperLinea).toHaveBeenCalledWith(1);
    expect(resultado).toBe(false);
  });
});