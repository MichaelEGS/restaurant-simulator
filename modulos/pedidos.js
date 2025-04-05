/**
 * Módulo Pedidos - Gestión de pedidos
 * Este módulo maneja la creación y gestión de pedidos
 */

import * as Mesas from "./mesas.js"
import * as Tiempo from "./tiempo.js"
import * as Facturacion from "./facturacion.js"
import * as Clientes from "./clientes.js"
import * as API from "./api.js"

// Función para generar un ID único para cada pedido
function generarPedidoId() {
  return "pedido_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
}

// Función para generar un número de orden secuencial
async function generarNumeroOrden() {
  const pedidos = await API.obtenerPedidos()
  const ultimoPedido =
    pedidos.length > 0
      ? pedidos.reduce((max, pedido) => (pedido.numeroOrden > max.numeroOrden ? pedido : max), { numeroOrden: 0 })
      : { numeroOrden: 0 }

  return ultimoPedido.numeroOrden + 1
}

// Función para crear un nuevo pedido
async function crearPedido(clienteId, items, tipo) {
  // Validar datos
  if (!clienteId || !items || items.length === 0) {
    throw new Error("Cliente e items son obligatorios")
  }

  // Obtener cliente
  const cliente = await Clientes.obtenerClientePorId(clienteId)
  if (!cliente) {
    throw new Error("Cliente no encontrado")
  }

  // Calcular tiempo de preparación total
  const tiempoPreparacion = await Tiempo.calcularTiempoPreparacion(items)

  // Calcular total del pedido
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)

  // Crear objeto pedido
  const nuevoPedido = {
    id: generarPedidoId(),
    numeroOrden: await generarNumeroOrden(),
    clienteId,
    nombreCliente: cliente.nombre,
    tipo: tipo || cliente.tipo, // Local o domicilio
    items,
    estado: "pendiente",
    fechaCreacion: new Date().toISOString(),
    tiempoPreparacion,
    tiempoEstimadoEntrega: null,
    mesaId: null, // Se asignará después si es pedido local
    total,
    direccionEntrega: cliente.direccion || null,
  }

  // Si es pedido local, asignar mesa
  if (nuevoPedido.tipo === "local") {
    const mesaAsignada = await Mesas.asignarMesa()
    if (mesaAsignada) {
      nuevoPedido.mesaId = mesaAsignada.id
    } else {
      throw new Error("No hay mesas disponibles")
    }
  }

  // Calcular tiempo estimado de entrega
  nuevoPedido.tiempoEstimadoEntrega = await Tiempo.calcularTiempoEntrega(nuevoPedido)

  // Guardar pedido en la base de datos
  const pedidos = await API.obtenerPedidos()
  pedidos.push(nuevoPedido)
  await API.actualizarPedidos(pedidos)

  // Actualizar estado del cliente
  cliente.estado = "con_pedido"
  await Clientes.actualizarCliente(clienteId, cliente)

  // Notificar a la UI que hay un nuevo pedido
  document.dispatchEvent(new CustomEvent("nuevoPedido", { detail: nuevoPedido }))

  return nuevoPedido
}

// Función para obtener un pedido por ID
async function obtenerPedidoPorId(pedidoId) {
  const pedidos = await API.obtenerPedidos()
  return pedidos.find((pedido) => pedido.id === pedidoId)
}

// Función para actualizar el estado de un pedido
async function actualizarEstadoPedido(pedidoId, nuevoEstado) {
  const pedidos = await API.obtenerPedidos()
  const indice = pedidos.findIndex((pedido) => pedido.id === pedidoId)

  if (indice === -1) {
    throw new Error("Pedido no encontrado")
  }

  // Actualizar estado del pedido
  pedidos[indice].estado = nuevoEstado

  // Si el pedido está completado, liberar la mesa si es un pedido local
  if (nuevoEstado === "entregado" && pedidos[indice].tipo === "local" && pedidos[indice].mesaId) {
    await Mesas.liberarMesa(pedidos[indice].mesaId)

    // Actualizar estadísticas
    const estadisticas = await API.obtenerEstadisticas()
    estadisticas.pedidosCompletados++
    estadisticas.ventasTotal += pedidos[indice].total
    await API.actualizarEstadisticas(estadisticas)
  }

  await API.actualizarPedidos(pedidos)

  // Notificar a la UI que el estado del pedido ha cambiado
  document.dispatchEvent(
    new CustomEvent("cambioEstadoPedido", {
      detail: {
        pedido: pedidos[indice],
        estadoAnterior: pedidos[indice].estado,
        nuevoEstado,
      },
    }),
  )

  return pedidos[indice]
}

// Función para cancelar un pedido
async function cancelarPedido(pedidoId) {
  const pedido = await obtenerPedidoPorId(pedidoId)

  if (!pedido) {
    throw new Error("Pedido no encontrado")
  }

  // Solo se pueden cancelar pedidos pendientes o en preparación
  if (pedido.estado !== "pendiente" && pedido.estado !== "en_preparacion") {
    throw new Error("No se puede cancelar un pedido que ya está listo o entregado")
  }

  // Si el pedido es local y tiene mesa asignada, liberarla
  if (pedido.tipo === "local" && pedido.mesaId) {
    await Mesas.liberarMesa(pedido.mesaId)
  }

  // Actualizar estado del pedido
  return await actualizarEstadoPedido(pedidoId, "cancelado")
}

// Función para iniciar la preparación de un pedido
async function iniciarPreparacion(pedidoId) {
  return await actualizarEstadoPedido(pedidoId, "en_preparacion")
}

// Función para marcar un pedido como listo
async function marcarPedidoListo(pedidoId) {
  return await actualizarEstadoPedido(pedidoId, "listo")
}

// Función para marcar un pedido como entregado
async function marcarPedidoEntregado(pedidoId) {
  const pedido = await actualizarEstadoPedido(pedidoId, "entregado")

  // Generar factura
  await Facturacion.generarFactura(pedido)

  return pedido
}

// Función para obtener pedidos por estado
async function obtenerPedidosPorEstado(estado) {
  const pedidos = await API.obtenerPedidos()
  return pedidos.filter((pedido) => pedido.estado === estado)
}

// Exportar funciones para módulos ES
export {
  crearPedido,
  obtenerPedidoPorId,
  actualizarEstadoPedido,
  cancelarPedido,
  iniciarPreparacion,
  marcarPedidoListo,
  marcarPedidoEntregado,
  obtenerPedidosPorEstado,
}

// Para compatibilidad con el código existente
window.Pedidos = {
  crearPedido,
  obtenerPedidoPorId,
  actualizarEstadoPedido,
  cancelarPedido,
  iniciarPreparacion,
  marcarPedidoListo,
  marcarPedidoEntregado,
  obtenerPedidosPorEstado,
}

