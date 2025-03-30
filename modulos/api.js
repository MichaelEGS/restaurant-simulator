/**
 * Módulo API - Simulación de API para comunicación entre módulos
 * Este módulo centraliza todas las operaciones de datos
 */

// Función para cargar los datos iniciales
async function cargarDatos() {
  try {
    // En un entorno real, esto sería una llamada fetch a un endpoint
    // Para esta simulación, cargamos el JSON directamente
    const dataElement = document.getElementById("data-json")
    if (dataElement && dataElement.textContent.trim()) {
      return JSON.parse(dataElement.textContent)
    } else {
      // Si no existe el elemento o está vacío, creamos datos por defecto
      return {
        clientes: [],
        mesas: Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          capacidad: i % 2 === 0 ? 4 : i % 3 === 0 ? 6 : 2,
          disponible: true,
        })),
        menu: {
          combos: [
            {
              id: "combo1",
              nombre: "Combo Familiar",
              descripcion: "Pizza grande, 4 bebidas y pan de ajo",
              precio: 25.99,
              imagen: "https://placehold.co/200x100/FF5733/FFFFFF/png?text=Combo+Familiar",
              tiempoPreparacion: 20,
            },
            {
              id: "combo2",
              nombre: "Combo Pareja",
              descripcion: "Pizza mediana, 2 bebidas y pan de ajo",
              precio: 18.99,
              imagen: "https://placehold.co/200x100/33A8FF/FFFFFF/png?text=Combo+Pareja",
              tiempoPreparacion: 15,
            },
            {
              id: "combo3",
              nombre: "Combo Individual",
              descripcion: "Pizza personal, bebida y postre",
              precio: 12.99,
              imagen: "https://placehold.co/200x100/33FF57/FFFFFF/png?text=Combo+Individual",
              tiempoPreparacion: 10,
            },
          ],
          pizzas: [
            {
              id: "pizza1",
              nombre: "Pizza Suprema",
              descripcion: "Jamón, pepperoni, pimientos, cebolla y champiñones",
              precio: 15.99,
              imagen: "https://placehold.co/200x100/FF3366/FFFFFF/png?text=Pizza+Suprema",
              tiempoPreparacion: 18,
            },
            {
              id: "pizza2",
              nombre: "Pizza Hawaiana",
              descripcion: "Jamón y piña",
              precio: 13.99,
              imagen: "https://placehold.co/200x100/FFCC33/FFFFFF/png?text=Pizza+Hawaiana",
              tiempoPreparacion: 15,
            },
          ],
          bebidas: [
            {
              id: "bebida1",
              nombre: "Refresco Cola",
              descripcion: "Refresco de cola 500ml",
              precio: 2.5,
              imagen: "https://placehold.co/200x100/000000/FFFFFF/png?text=Refresco+Cola",
              tiempoPreparacion: 1,
            },
            {
              id: "bebida2",
              nombre: "Refresco Naranja",
              descripcion: "Refresco de naranja 500ml",
              precio: 2.5,
              imagen: "https://placehold.co/200x100/FF9933/FFFFFF/png?text=Refresco+Naranja",
              tiempoPreparacion: 1,
            },
          ],
        },
        pedidos: [],
        facturas: [],
        estadisticas: {
          clientesAtendidos: 0,
          pedidosCompletados: 0,
          ventasTotal: 0,
        },
      }
    }
  } catch (error) {
    console.error("Error al cargar datos:", error)
    // En caso de error, devolver datos por defecto
    return {
      clientes: [],
      mesas: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        capacidad: 4,
        disponible: true,
      })),
      menu: {
        combos: [],
        pizzas: [],
        bebidas: [],
      },
      pedidos: [],
      facturas: [],
      estadisticas: {
        clientesAtendidos: 0,
        pedidosCompletados: 0,
        ventasTotal: 0,
      },
    }
  }
}

// Variable global para almacenar los datos
let datosGlobales = null

// Inicializar datos
async function inicializarDatos() {
  datosGlobales = await cargarDatos()
  return datosGlobales
}

// Función para obtener todos los datos
async function obtenerDatos() {
  if (!datosGlobales) {
    await inicializarDatos()
  }
  return datosGlobales
}

// Función para guardar datos (simula una actualización en la base de datos)
async function guardarDatos(datos) {
  return new Promise((resolve) => {
    setTimeout(() => {
      datosGlobales = datos
      resolve(true)
    }, 100) // Simulamos un pequeño retraso de red
  })
}

// Funciones específicas para cada entidad
async function obtenerClientes() {
  const datos = await obtenerDatos()
  return datos.clientes
}

async function obtenerMesas() {
  const datos = await obtenerDatos()
  return datos.mesas
}

async function obtenerMenu() {
  const datos = await obtenerDatos()
  return datos.menu
}

async function obtenerPedidos() {
  const datos = await obtenerDatos()
  return datos.pedidos
}

async function obtenerFacturas() {
  const datos = await obtenerDatos()
  return datos.facturas
}

async function obtenerEstadisticas() {
  const datos = await obtenerDatos()
  return datos.estadisticas
}

// Funciones para actualizar entidades
async function actualizarClientes(clientes) {
  const datos = await obtenerDatos()
  datos.clientes = clientes
  await guardarDatos(datos)
  return clientes
}

async function actualizarMesas(mesas) {
  const datos = await obtenerDatos()
  datos.mesas = mesas
  await guardarDatos(datos)
  return mesas
}

async function actualizarPedidos(pedidos) {
  const datos = await obtenerDatos()
  datos.pedidos = pedidos
  await guardarDatos(datos)
  return pedidos
}

async function actualizarFacturas(facturas) {
  const datos = await obtenerDatos()
  datos.facturas = facturas
  await guardarDatos(datos)
  return facturas
}

async function actualizarEstadisticas(estadisticas) {
  const datos = await obtenerDatos()
  datos.estadisticas = estadisticas
  await guardarDatos(datos)
  return estadisticas
}

// Exportar todas las funciones
export {
  inicializarDatos,
  obtenerDatos,
  guardarDatos,
  obtenerClientes,
  obtenerMesas,
  obtenerMenu,
  obtenerPedidos,
  obtenerFacturas,
  obtenerEstadisticas,
  actualizarClientes,
  actualizarMesas,
  actualizarPedidos,
  actualizarFacturas,
  actualizarEstadisticas,
}

// Para compatibilidad con el código existente
window.API = {
  inicializarDatos,
  obtenerDatos,
  guardarDatos,
  obtenerClientes,
  obtenerMesas,
  obtenerMenu,
  obtenerPedidos,
  obtenerFacturas,
  obtenerEstadisticas,
  actualizarClientes,
  actualizarMesas,
  actualizarPedidos,
  actualizarFacturas,
  actualizarEstadisticas,
}

// Inicializar datos al cargar la página
document.addEventListener("DOMContentLoaded", inicializarDatos)

