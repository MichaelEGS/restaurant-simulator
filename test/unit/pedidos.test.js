import * as Pedidos from '../../modulos/pedidos.js';

describe('Flujo de Pedidos', () => {
  const clienteMock = {
    id: 'cliente-test',
    nombre: 'Cliente Prueba',
    tipo: 'local'
  };

  test('Crea pedido local con mesa asignada', async () => {
    const pedido = await Pedidos.crearPedido(clienteMock.id, [], 'local');
    expect(pedido.mesaId).not.toBeNull();
    expect(pedido.estado).toBe('pendiente');
  });

  test('Bloquea pedidos sin items', async () => {
    await expect(Pedidos.crearPedido(clienteMock.id, [], 'local'))
      .rejects.toThrow('Items son obligatorios');
  });
});
