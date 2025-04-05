// jest.setup.js
import * as API from './modulos/api.js';
import * as Clientes from './modulos/clientes.js';
import * as Facturacion from './modulos/facturacion.js';
import * as Mesas from './modulos/mesas.js';
import * as Pedidos from './modulos/pedidos.js';
import * as Tiempo from './modulos/tiempo.js';

// En un entorno jsdom, window está definido.
window.API = API;
window.Clientes = Clientes;
window.Facturacion = Facturacion;
window.Mesas = Mesas;
window.Pedidos = Pedidos;
window.Tiempo = Tiempo;
