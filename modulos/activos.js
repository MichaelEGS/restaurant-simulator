/**
 * Módulo Activos - Dashboard y visualización
 * Este módulo maneja la visualización del estado del sistema
 */

import * as Tiempo from "./tiempo.js"
import * as Clientes from "./clientes.js"
import * as Pedidos from "./pedidos.js"
import * as Facturacion from "./facturacion.js"
import * as API from "./api.js"

// Objeto para almacenar las simulaciones en curso
const simulacionesActivas = {}

// Función para inicializar el dashboard
async function inicializarDashboard() {
  // Cargar datos iniciales
  await actualizarEstadisticasDashboard()
  await renderizarMesas()

  // Configurar listeners para eventos
  configurarEventListeners()
}

// Función para actualizar las estadísticas del dashboard
async function actualizarEstadisticasDashboard() {
  // Obtener datos
  const clientes = await API.obtenerClientes()
  const mesas = await API.obtenerMesas()
  const pedidos = await API.obtenerPedidos()
  const estadisticas = await API.obtenerEstadisticas()

  // Actualizar contadores
  const clientesEnCola = clientes.filter((cliente) => cliente.estado === "en_cola").length
  document.getElementById("queue-count").textContent = clientesEnCola

  const mesasOcupadas = mesas.filter((mesa) => !mesa.disponible).length
  document.getElementById("tables-occupied").textContent = `${mesasOcupadas}/${mesas.length}`

  const pedidosEnPreparacion = pedidos.filter(
    (pedido) => pedido.estado === "pendiente" || pedido.estado === "en_preparacion",
  ).length
  document.getElementById("orders-in-progress").textContent = pedidosEnPreparacion

  document.getElementById("orders-completed").textContent = estadisticas.pedidosCompletados
}

// Función para renderizar las mesas
async function renderizarMesas() {
  const mesas = await API.obtenerMesas()
  const tablesGrid = document.getElementById("tables-grid")

  // Limpiar contenedor
  tablesGrid.innerHTML = ""

  // Renderizar cada mesa
  mesas.forEach((mesa) => {
    const tableElement = document.createElement("div")
    tableElement.className = `table ${mesa.disponible ? "available" : "occupied"}`
    tableElement.dataset.mesaId = mesa.id

    tableElement.innerHTML = `
            <div class="table-number">Mesa ${mesa.id}</div>
            <div class="table-status">${mesa.disponible ? "Disponible" : "Ocupada"}</div>
        `

    tablesGrid.appendChild(tableElement)
  })
}

// Función para renderizar la cola de clientes
async function renderizarColaClientes() {
  const clientes = await API.obtenerClientes()
  const queueContainer = document.getElementById("customer-queue")

  // Filtrar clientes en cola
  const clientesEnCola = clientes
    .filter((cliente) => cliente.estado === "en_cola")
    .sort((a, b) => new Date(a.horaLlegada) - new Date(b.horaLlegada))

  // Limpiar contenedor
  queueContainer.innerHTML = ""

  // Renderizar cada cliente
  clientesEnCola.forEach((cliente) => {
    const clienteElement = document.createElement("div")
    clienteElement.className = "customer-card"
    clienteElement.dataset.clienteId = cliente.id

    clienteElement.innerHTML = `
            <img src="${cliente.avatar}" alt="Avatar" class="customer-avatar">
            <div class="customer-info">
                <div class="customer-name">${cliente.nombre}</div>
                <div class="customer-type">${cliente.tipo === "local" ? "En Local" : "A Domicilio"}</div>
            </div>
        `

    queueContainer.appendChild(clienteElement)
  })
}

// Función para renderizar pedidos en cocina
async function renderizarPedidosCocina() {
  const pedidos = await API.obtenerPedidos()
  const kitchenContainer = document.getElementById("kitchen-orders")

  // Filtrar pedidos en preparación
  const pedidosEnPreparacion = pedidos
    .filter((pedido) => pedido.estado === "pendiente" || pedido.estado === "en_preparacion")
    .sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion))

  // Limpiar contenedor
  kitchenContainer.innerHTML = ""

  // Renderizar cada pedido
  pedidosEnPreparacion.forEach((pedido) => {
    const pedidoElement = document.createElement("div")
    pedidoElement.className = "kitchen-order"
    pedidoElement.dataset.pedidoId = pedido.id

    // Calcular tiempo restante
    const tiempoRestante = Tiempo.formatearTiempoRestante(pedido.tiempoEstimadoEntrega)

    pedidoElement.innerHTML = `
            <div class="kitchen-order-header">
                <span class="kitchen-order-number">Orden #${pedido.numeroOrden}</span>
                <span class="kitchen-order-time">${tiempoRestante}</span>
            </div>
            <div class="kitchen-order-items">
                ${pedido.items.map((item) => `${item.cantidad}x ${item.nombre}`).join(", ")}
            </div>
            <div class="kitchen-order-progress">
                <div class="progress-bar" style="width: ${pedido.estado === "en_preparacion" ? "50%" : "10%"}"></div>
            </div>
        `

    kitchenContainer.appendChild(pedidoElement)
  })
}

// Función para renderizar pedidos recientes
async function renderizarPedidosRecientes() {
  const pedidos = await API.obtenerPedidos()
  const recentOrdersContainer = document.getElementById("recent-orders")

  // Obtener los últimos 6 pedidos
  const pedidosRecientes = pedidos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)).slice(0, 6)

  // Limpiar contenedor
  recentOrdersContainer.innerHTML = ""

  // Renderizar cada pedido
  pedidosRecientes.forEach((pedido) => {
    const pedidoElement = document.createElement("div")
    pedidoElement.className = "order-card"
    pedidoElement.dataset.pedidoId = pedido.id

    // Determinar clase de estado
    let estadoClase = ""
    switch (pedido.estado) {
      case "pendiente":
        estadoClase = "status-pending"
        break
      case "en_preparacion":
        estadoClase = "status-preparing"
        break
      case "listo":
        estadoClase = "status-ready"
        break
      case "entregado":
        estadoClase = "status-delivered"
        break
    }

    pedidoElement.innerHTML = `
            <div class="order-card-header">
                <span class="order-card-number">Orden #${pedido.numeroOrden}</span>
                <span class="order-card-status ${estadoClase}">${traducirEstado(pedido.estado)}</span>
            </div>
            <div class="order-card-customer">
                Cliente: ${pedido.nombreCliente} (${pedido.tipo === "local" ? "En Local" : "A Domicilio"})
            </div>
            <div class="order-card-items">
                ${pedido.items.length} items
            </div>
            <div class="order-card-total">
                Total: ${Facturacion.formatearTotal(pedido.total)}
            </div>
        `

    recentOrdersContainer.appendChild(pedidoElement)
  })
}

// Función para renderizar pedidos a domicilio
async function renderizarPedidosDomicilio() {
  const pedidos = await API.obtenerPedidos()
  const deliveryContainer = document.getElementById("delivery-orders")

  if (!deliveryContainer) return

  // Filtrar pedidos a domicilio
  const pedidosDomicilio = pedidos
    .filter(
      (pedido) => pedido.tipo === "domicilio" && (pedido.estado === "listo" || pedido.estado === "en_preparacion"),
    )
    .sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion))

  // Limpiar contenedor
  deliveryContainer.innerHTML = ""

  if (pedidosDomicilio.length === 0) {
    deliveryContainer.innerHTML = '<div class="empty-message">No hay pedidos a domicilio en este momento</div>'
    return
  }

  // Renderizar cada pedido
  pedidosDomicilio.forEach((pedido) => {
    const pedidoElement = document.createElement("div")
    pedidoElement.className = "delivery-order"
    pedidoElement.dataset.pedidoId = pedido.id

    // Calcular tiempo restante
    const tiempoRestante = Tiempo.formatearTiempoRestante(pedido.tiempoEstimadoEntrega)

    pedidoElement.innerHTML = `
            <div class="delivery-order-header">
                <span class="delivery-order-number">Orden #${pedido.numeroOrden}</span>
                <span class="delivery-order-time">${tiempoRestante}</span>
            </div>
            <div class="delivery-order-customer">
                Cliente: ${pedido.nombreCliente}
            </div>
            <div class="delivery-order-address">
                Dirección: ${pedido.direccionEntrega || "No especificada"}
            </div>
            <div class="delivery-order-items">
                ${pedido.items.map((item) => `${item.cantidad}x ${item.nombre}`).join(", ")}
            </div>
            <div class="delivery-order-actions">
                <button class="btn btn-primary btn-entregar" data-pedido-id="${pedido.id}">
                    Marcar como Entregado
                </button>
            </div>
        `

    deliveryContainer.appendChild(pedidoElement)
  })

  // Agregar event listeners a los botones de entrega
  document.querySelectorAll(".btn-entregar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const pedidoId = e.target.dataset.pedidoId
      await Pedidos.marcarPedidoEntregado(pedidoId)
      renderizarPedidosDomicilio()
      renderizarPedidosRecientes()
      actualizarEstadisticasDashboard()
    })
  })
}

// Función para traducir estado a español
function traducirEstado(estado) {
  switch (estado) {
    case "pendiente":
      return "Pendiente"
    case "en_preparacion":
      return "Preparando"
    case "listo":
      return "Listo"
    case "entregado":
      return "Entregado"
    case "cancelado":
      return "Cancelado"
    default:
      return estado
  }
}

// Función para configurar event listeners
function configurarEventListeners() {
  // Escuchar eventos de clientes
  document.addEventListener("clienteEnCola", () => {
    renderizarColaClientes()
    actualizarEstadisticasDashboard()
  })

  document.addEventListener("clienteAtendido", () => {
    renderizarColaClientes()
    actualizarEstadisticasDashboard()
  })

  // Escuchar eventos de mesas
  document.addEventListener("mesaOcupada", () => {
    renderizarMesas()
    actualizarEstadisticasDashboard()
  })

  document.addEventListener("mesaLiberada", () => {
    renderizarMesas()
    actualizarEstadisticasDashboard()
  })

  // Escuchar eventos de pedidos
  document.addEventListener("nuevoPedido", () => {
    renderizarPedidosCocina()
    renderizarPedidosRecientes()
    renderizarPedidosDomicilio()
    actualizarEstadisticasDashboard()
  })

  document.addEventListener("cambioEstadoPedido", () => {
    renderizarPedidosCocina()
    renderizarPedidosRecientes()
    renderizarPedidosDomicilio()
    actualizarEstadisticasDashboard()
  })

  // Escuchar eventos de facturas
  document.addEventListener("nuevaFactura", () => {
    renderizarPedidosRecientes()
    actualizarEstadisticasDashboard()
  })
}

// Función para simular el progreso de un pedido
function simularProgresoPedido(pedido) {
  // Cancelar simulación existente si hay una
  if (simulacionesActivas[pedido.id]) {
    simulacionesActivas[pedido.id].cancelar()
  }

  // Iniciar simulación de preparación
  simulacionesActivas[pedido.id] = Tiempo.simularProgresoPreparacion(
    pedido.id,
    pedido.tiempoPreparacion,
    async (pedidoId, progreso) => {
      // Actualizar barra de progreso en la UI
      const pedidoElement = document.querySelector(`.kitchen-order[data-pedido-id="${pedidoId}"]`)
      if (pedidoElement) {
        const progressBar = pedidoElement.querySelector(".progress-bar")
        if (progressBar) {
          progressBar.style.width = `${progreso}%`
        }
      }

      // Cuando llegue al 50%, cambiar estado a "en_preparacion"
      if (progreso >= 50 && pedido.estado === "pendiente") {
        await Pedidos.iniciarPreparacion(pedidoId)
      }
    },
    async (pedidoId) => {
      // Cuando se complete, marcar como listo
      await Pedidos.marcarPedidoListo(pedidoId)

      // Eliminar de simulaciones activas
      delete simulacionesActivas[pedidoId]
    },
  )
}

// Función para iniciar simulación automática
function iniciarSimulacionAutomatica() {
  // Intervalo para procesar la cola
  const intervaloProcesarCola = setInterval(async () => {
    const clientes = await API.obtenerClientes()
    const clientesEnCola = clientes.filter((cliente) => cliente.estado === "en_cola")

    if (clientesEnCola.length > 0) {
      await Clientes.atenderSiguienteCliente()
    }
  }, 5000) // Cada 5 segundos

  // Intervalo para procesar pedidos listos
  const intervaloProcesarPedidos = setInterval(async () => {
    const pedidos = await API.obtenerPedidos()
    const pedidosListos = pedidos.filter((pedido) => pedido.estado === "listo" && pedido.tipo === "local")

    if (pedidosListos.length > 0) {
      // Entregar el pedido más antiguo
      const pedidoAEntregar = pedidosListos.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion))[0]

      await Pedidos.marcarPedidoEntregado(pedidoAEntregar.id)
    }
  }, 8000) // Cada 8 segundos

  return {
    detener: () => {
      clearInterval(intervaloProcesarCola)
      clearInterval(intervaloProcesarPedidos)

      // Detener todas las simulaciones activas
      Object.values(simulacionesActivas).forEach((sim) => sim.cancelar())
    },
  }
}

// Exportar funciones
export {
  inicializarDashboard,
  actualizarEstadisticasDashboard,
  renderizarMesas,
  renderizarColaClientes,
  renderizarPedidosCocina,
  renderizarPedidosRecientes,
  renderizarPedidosDomicilio,
  simularProgresoPedido,
  iniciarSimulacionAutomatica,
}

// Para compatibilidad con el código existente
window.Activos = {
  inicializarDashboard,
  actualizarEstadisticasDashboard,
  renderizarMesas,
  renderizarColaClientes,
  renderizarPedidosCocina,
  renderizarPedidosRecientes,
  renderizarPedidosDomicilio,
  simularProgresoPedido,
  iniciarSimulacionAutomatica,
}

