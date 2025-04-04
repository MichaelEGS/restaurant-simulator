const API = require('../modulos/api');

describe('Módulo API', () => {
  beforeEach(async () => {
    await API.inicializarDatos();
  });

  test('Carga datos iniciales correctamente', async () => {
    const datos = await API.obtenerDatos();
    expect(datos).toHaveProperty('mesas');
    expect(datos.mesas.length).toBe(8);
  });

  test('Guarda y recupera pedidos', async () => {
    const nuevoPedido = { id: 'test1', items: [] };
    const pedidos = await API.obtenerPedidos();
    pedidos.push(nuevoPedido);
    
    await API.actualizarPedidos(pedidos);
    const pedidosActualizados = await API.obtenerPedidos();
    
    expect(pedidosActualizados).toContainEqual(nuevoPedido);
  });
});