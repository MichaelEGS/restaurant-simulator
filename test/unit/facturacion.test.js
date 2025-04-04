const Facturacion = require('../modulos/facturacion');
const API = require('../modulos/api');

describe('Módulo Facturación', () => {
  let pedidoEjemplo;

  beforeEach(async () => {
    pedidoEjemplo = {
      id: 'pedido-test',
      total: 45.99,
      items: [{ nombre: 'Pizza', precio: 45.99 }]
    };
    await API.actualizarFacturas([]);
  });

  test('Genera factura con ID único', async () => {
    const factura = await Facturacion.generarFactura(pedidoEjemplo);
    expect(factura.id).toMatch(/factura_\d+/);
    expect(factura.total).toBe(45.99);
  });
});