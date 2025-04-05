import Clientes from '../modulos/clientes.js';

describe('Gestión de Clientes', () => {
  test('Crea cliente con avatar único', async () => {
    const cliente = await Clientes.crearCliente('Juan', 'local');
    expect(cliente.avatar).toMatch(/placehold\.co\/.*J/);
  });

  test('Valida dirección para domicilio', async () => {
    await expect(Clientes.crearCliente('Maria', 'domicilio'))
      .rejects.toThrow('dirección es obligatoria');
  });
});
