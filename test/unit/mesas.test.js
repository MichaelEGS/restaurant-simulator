import * as Mesas from '../../modulos/mesas.js';
import * as API from '../../modulos/api.js';

describe('Gestión de Mesas', () => {
  beforeEach(async () => {
    await API.inicializarDatos();
  });

  test('Asigna y libera mesa correctamente', async () => {
    const mesaAsignada = await Mesas.asignarMesa();
    expect(mesaAsignada.disponible).toBe(false);

    const mesaLiberada = await Mesas.liberarMesa(mesaAsignada.id);
    expect(mesaLiberada.disponible).toBe(true);
  });
});
