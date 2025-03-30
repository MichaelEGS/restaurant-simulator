/**
 * Módulo UI Integration - Integración entre la UI y los módulos
 * Este módulo maneja la interacción del usuario con la interfaz
 */

import * as Activos from "./activos.js"
import * as Clientes from "./clientes.js"
import * as Pedidos from "./pedidos.js"
import * as Facturacion from "./facturacion.js"
import * as API from "./api.js"

// Variable para almacenar la simulación en curso
let simulacionActual = null

// Función para inicializar la UI
async function inicializarUI() {
  // Inicializar dashboard
  await Activos.inicializarDashboard()

  // Cargar datos iniciales
  await cargarDatosIniciales()

  // Configurar event listeners
  configurarEventListeners()

  // Actualizar estado de los botones de simulación
  actualizarEstadoBotones()
}

// Función para cargar datos iniciales
async function cargarDatosIniciales() {
  // Renderizar mesas
  await Activos.renderizarMesas()

  // Renderizar pedidos recientes
  await Activos.renderizarPedidosRecientes()

  // Renderizar pedidos a domicilio
  if (document.getElementById("delivery-orders")) {
    await Activos.renderizarPedidosDomicilio()
  }
}

// Función para actualizar el estado de los botones de simulación
function actualizarEstadoBotones() {
  const startBtn = document.getElementById("start-simulation")
  const pauseBtn = document.getElementById("pause-simulation")
  const resetBtn = document.getElementById("reset-simulation")

  if (simulacionActual) {
    startBtn.disabled = true
    pauseBtn.disabled = false
    startBtn.classList.add("disabled")
    pauseBtn.classList.remove("disabled")
  } else {
    startBtn.disabled = false
    pauseBtn.disabled = true
    startBtn.classList.remove("disabled")
    pauseBtn.classList.add("disabled")
  }

  // El botón de reinicio siempre está disponible
  resetBtn.disabled = false
}

// Función para configurar event listeners
function configurarEventListeners() {
  // Botones de control de simulación
  document.getElementById("add-customer").addEventListener("click", agregarClienteAleatorio)
  document.getElementById("start-simulation").addEventListener("click", iniciarSimulacion)
  document.getElementById("pause-simulation").addEventListener("click", pausarSimulacion)
  document.getElementById("reset-simulation").addEventListener("click", reiniciarSimulacion)

  // Modal de pedido
  const orderModal = document.getElementById("order-modal")
  const closeButtons = orderModal.querySelectorAll(".close, #cancel-order")

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      orderModal.style.display = "none"
    })
  })

  // Tipo de cliente en modal
  document.getElementById("customer-type").addEventListener("change", function () {
    const addressGroup = document.getElementById("address-group")
    addressGroup.style.display = this.value === "domicilio" ? "block" : "none"
  })

  // Tabs del menú
  const menuTabs = document.querySelectorAll(".menu-tab")
  menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Desactivar todos los tabs
      menuTabs.forEach((t) => t.classList.remove("active"))

      // Activar el tab actual
      tab.classList.add("active")

      // Cargar items de la categoría seleccionada
      cargarItemsMenu(tab.dataset.category)
    })
  })

  // Confirmar pedido
  document.getElementById("confirm-order").addEventListener("click", confirmarPedido)

  // Modal de factura
  const invoiceModal = document.getElementById("invoice-modal")
  const closeInvoiceButtons = invoiceModal.querySelectorAll(".close, #close-invoice")

  closeInvoiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      invoiceModal.style.display = "none"
    })
  })

  // Cerrar modales al hacer clic fuera de ellos
  window.addEventListener("click", (event) => {
    if (event.target === orderModal) {
      orderModal.style.display = "none"
    }
    if (event.target === invoiceModal) {
      invoiceModal.style.display = "none"
    }
  })

  // Evento para atender cliente al hacer clic en la cola
  document.getElementById("customer-queue").addEventListener("click", (event) => {
    const clienteCard = event.target.closest(".customer-card")
    if (clienteCard) {
      const clienteId = clienteCard.dataset.clienteId
      atenderCliente(clienteId)
    }
  })

  // Evento para ver detalles de pedido al hacer clic en pedidos recientes
  document.getElementById("recent-orders").addEventListener("click", (event) => {
    const orderCard = event.target.closest(".order-card")
    if (orderCard) {
      const pedidoId = orderCard.dataset.pedidoId
      mostrarDetallePedido(pedidoId)
    }
  })

  // Evento para pedidos a domicilio
  const deliveryOrders = document.getElementById("delivery-orders")
  if (deliveryOrders) {
    deliveryOrders.addEventListener("click", (event) => {
      const deliveryOrder = event.target.closest(".delivery-order")
      if (deliveryOrder) {
        const pedidoId = deliveryOrder.dataset.pedidoId

        // Si se hizo clic en el botón de entregar
        if (event.target.classList.contains("btn-entregar")) {
          Pedidos.marcarPedidoEntregado(pedidoId)
            .then(() => {
              Activos.renderizarPedidosDomicilio()
              Activos.renderizarPedidosRecientes()
              Activos.actualizarEstadisticasDashboard()
            })
            .catch((error) => {
              console.error("Error al entregar pedido:", error)
              alert(`Error al entregar pedido: ${error.message}`)
            })
        } else {
          // Si se hizo clic en otra parte del pedido, mostrar detalles
          mostrarDetallePedido(pedidoId)
        }
      }
    })
  }
}

// Función para agregar un cliente aleatorio a la cola
async function agregarClienteAleatorio() {
  try {
    // Nombres aleatorios
    const nombres = [
      "Juan",
      "María",
      "Carlos",
      "Ana",
      "Pedro",
      "Laura",
      "Miguel",
      "Sofía",
      "José",
      "Lucía",
      "Fernando",
      "Valentina",
    ]

    // Apellidos aleatorios
    const apellidos = [
      "García",
      "Rodríguez",
      "López",
      "Martínez",
      "González",
      "Pérez",
      "Sánchez",
      "Ramírez",
      "Torres",
      "Flores",
      "Rivera",
      "Gómez",
    ]

    // Generar nombre aleatorio
    const nombre = `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`

    // Tipo aleatorio (70% local, 30% domicilio)
    const tipo = Math.random() < 0.7 ? "local" : "domicilio"

    // Dirección aleatoria para domicilio
    const direccion = tipo === "domicilio" ? "Calle Principal #123, Ciudad" : null

    // Crear cliente
    const cliente = await Clientes.crearCliente(nombre, tipo, direccion)

    // Agregar a la cola
    await Clientes.agregarClienteACola(cliente)

    // Actualizar UI
    Activos.renderizarColaClientes()
    Activos.actualizarEstadisticasDashboard()
  } catch (error) {
    console.error("Error al agregar cliente:", error)
    alert(`Error al agregar cliente: ${error.message}`)
  }
}

// Función para atender a un cliente
async function atenderCliente(clienteId) {
  try {
    // Obtener cliente
    const clientes = await API.obtenerClientes()
    const cliente = clientes.find((c) => c.id === clienteId)

    if (!cliente || cliente.estado !== "en_cola") {
      return
    }

    // Actualizar estado del cliente
    await Clientes.atenderSiguienteCliente()

    // Mostrar modal de pedido
    mostrarModalPedido(cliente)
  } catch (error) {
    console.error("Error al atender cliente:", error)
    alert(`Error al atender cliente: ${error.message}`)
  }
}

// Función para mostrar el modal de pedido
async function mostrarModalPedido(cliente) {
  try {
    // Llenar datos del cliente
    document.getElementById("customer-name").value = cliente.nombre

    const tipoSelect = document.getElementById("customer-type")
    tipoSelect.value = cliente.tipo

    const addressGroup = document.getElementById("address-group")
    addressGroup.style.display = cliente.tipo === "domicilio" ? "block" : "none"

    if (cliente.tipo === "domicilio" && cliente.direccion) {
      document.getElementById("customer-address").value = cliente.direccion
    }

    // Cargar items del menú (por defecto, combos)
    cargarItemsMenu("combos")

    // Limpiar resumen del pedido
    document.getElementById("order-items-list").innerHTML = ""
    document.getElementById("order-total").textContent = "$0.00"

    // Guardar ID del cliente en el botón de confirmar
    document.getElementById("confirm-order").dataset.clienteId = cliente.id

    // Mostrar modal
    document.getElementById("order-modal").style.display = "block"
  } catch (error) {
    console.error("Error al mostrar modal de pedido:", error)
    alert(`Error al mostrar modal de pedido: ${error.message}`)
  }
}

// Función para cargar items del menú
async function cargarItemsMenu(categoria) {
  try {
    const menu = await API.obtenerMenu()
    const items = menu[categoria] || []

    const menuItemsContainer = document.getElementById("menu-items")
    menuItemsContainer.innerHTML = ""

    items.forEach((item) => {
      const itemElement = document.createElement("div")
      itemElement.className = "menu-item"
      itemElement.dataset.itemId = item.id
      itemElement.dataset.itemNombre = item.nombre
      itemElement.dataset.itemPrecio = item.precio

      itemElement.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" class="menu-item-image">
        <div class="menu-item-name">${item.nombre}</div>
        <div class="menu-item-price">${Facturacion.formatearTotal(item.precio)}</div>
      `

      // Evento para seleccionar/deseleccionar item
      itemElement.addEventListener("click", () => {
        toggleItemSeleccion(itemElement, item)
      })

      menuItemsContainer.appendChild(itemElement)
    })
  } catch (error) {
    console.error("Error al cargar items del menú:", error)
    alert(`Error al cargar items del menú: ${error.message}`)
  }
}

// Función para alternar selección de item
function toggleItemSeleccion(itemElement, item) {
  // Alternar clase de selección
  itemElement.classList.toggle("selected")

  // Obtener lista de items seleccionados
  const orderItemsList = document.getElementById("order-items-list")

  if (itemElement.classList.contains("selected")) {
    // Agregar item al resumen
    const itemId = item.id
    const existingItem = document.querySelector(`#order-items-list li[data-item-id="${itemId}"]`)

    if (existingItem) {
      // Incrementar cantidad si ya existe
      const cantidadElement = existingItem.querySelector(".item-quantity")
      const cantidad = Number.parseInt(cantidadElement.textContent) + 1
      cantidadElement.textContent = cantidad

      // Actualizar subtotal
      const subtotalElement = existingItem.querySelector(".item-subtotal")
      const subtotal = cantidad * item.precio
      subtotalElement.textContent = Facturacion.formatearTotal(subtotal)
    } else {
      // Agregar nuevo item
      const li = document.createElement("li")
      li.dataset.itemId = itemId
      li.dataset.itemPrecio = item.precio

      li.innerHTML = `
        <span class="item-name">${item.nombre}</span>
        <span class="item-quantity">1</span>x
        <span class="item-price">${Facturacion.formatearTotal(item.precio)}</span> = 
        <span class="item-subtotal">${Facturacion.formatearTotal(item.precio)}</span>
      `

      orderItemsList.appendChild(li)
    }
  } else {
    // Eliminar item del resumen
    const itemId = item.id
    const existingItem = document.querySelector(`#order-items-list li[data-item-id="${itemId}"]`)

    if (existingItem) {
      orderItemsList.removeChild(existingItem)
    }
  }

  // Actualizar total
  actualizarTotalPedido()
}

// Función para actualizar el total del pedido
function actualizarTotalPedido() {
  const items = document.querySelectorAll("#order-items-list li")
  let total = 0

  items.forEach((item) => {
    const cantidad = Number.parseInt(item.querySelector(".item-quantity").textContent)
    const precio = Number.parseFloat(item.dataset.itemPrecio)
    total += cantidad * precio
  })

  document.getElementById("order-total").textContent = Facturacion.formatearTotal(total)
}

// Función para confirmar pedido
async function confirmarPedido() {
  try {
    // Obtener datos del cliente
    const clienteId = document.getElementById("confirm-order").dataset.clienteId
    const nombre = document.getElementById("customer-name").value
    const tipo = document.getElementById("customer-type").value
    const direccion = document.getElementById("customer-address").value

    // Validar datos
    if (!nombre) {
      alert("Por favor, ingrese el nombre del cliente")
      return
    }

    if (tipo === "domicilio" && !direccion) {
      alert("Por favor, ingrese la dirección de entrega")
      return
    }

    // Obtener items seleccionados
    const itemsElements = document.querySelectorAll("#order-items-list li")
    if (itemsElements.length === 0) {
      alert("Por favor, seleccione al menos un producto")
      return
    }

    // Crear array de items para el pedido
    const items = []
    itemsElements.forEach((itemElement) => {
      const itemId = itemElement.dataset.itemId
      const itemNombre = itemElement.querySelector(".item-name").textContent
      const cantidad = Number.parseInt(itemElement.querySelector(".item-quantity").textContent)
      const precio = Number.parseFloat(itemElement.dataset.itemPrecio)

      items.push({
        id: itemId,
        nombre: itemNombre,
        cantidad,
        precio,
      })
    })

    // Actualizar datos del cliente si es necesario
    await Clientes.actualizarCliente(clienteId, {
      nombre,
      tipo,
      direccion: tipo === "domicilio" ? direccion : null,
    })

    // Crear pedido
    const pedido = await Pedidos.crearPedido(clienteId, items, tipo)

    // Cerrar modal
    document.getElementById("order-modal").style.display = "none"

    // Iniciar simulación de preparación
    Activos.simularProgresoPedido(pedido)

    // Actualizar UI
    Activos.renderizarColaClientes()
    Activos.renderizarPedidosCocina()
    Activos.renderizarPedidosRecientes()
    Activos.renderizarPedidosDomicilio()
    Activos.actualizarEstadisticasDashboard()

    // Mostrar factura
    const factura = await Facturacion.generarFactura(pedido)
    mostrarFactura(factura)
  } catch (error) {
    console.error("Error al crear el pedido:", error)
    alert(`Error al crear el pedido: ${error.message}`)
  }
}

// Función para mostrar factura
function mostrarFactura(factura) {
  try {
    // Llenar datos de la factura
    document.getElementById("invoice-order-number").textContent = factura.numeroOrden
    document.getElementById("invoice-date").textContent = new Date(factura.fechaEmision).toLocaleString()
    document.getElementById("invoice-customer-name").textContent = factura.nombreCliente
    document.getElementById("invoice-customer-type").textContent = factura.tipo === "local" ? "En Local" : "A Domicilio"

    const addressContainer = document.getElementById("invoice-address-container")
    if (factura.tipo === "domicilio" && factura.direccion) {
      addressContainer.style.display = "block"
      document.getElementById("invoice-customer-address").textContent = factura.direccion
    } else {
      addressContainer.style.display = "none"
    }

    // Llenar items
    const invoiceItemsContainer = document.getElementById("invoice-items")
    invoiceItemsContainer.innerHTML = ""

    factura.items.forEach((item) => {
      const tr = document.createElement("tr")
      const subtotal = item.precio * item.cantidad

      tr.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${Facturacion.formatearTotal(item.precio)}</td>
        <td>${Facturacion.formatearTotal(subtotal)}</td>
      `

      invoiceItemsContainer.appendChild(tr)
    })

    // Llenar total
    document.getElementById("invoice-total").textContent = Facturacion.formatearTotal(factura.total)

    // Mostrar modal
    document.getElementById("invoice-modal").style.display = "block"
  } catch (error) {
    console.error("Error al mostrar factura:", error)
    alert(`Error al mostrar factura: ${error.message}`)
  }
}

// Función para mostrar detalle de pedido
async function mostrarDetallePedido(pedidoId) {
  try {
    const pedido = await Pedidos.obtenerPedidoPorId(pedidoId)
    if (!pedido) return

    // Buscar factura asociada
    const facturas = await API.obtenerFacturas()
    const factura = facturas.find((f) => f.pedidoId === pedidoId)

    if (factura) {
      mostrarFactura(factura)
    } else {
      // Si no hay factura, generar una temporal
      const facturaTemp = {
        numeroOrden: pedido.numeroOrden,
        fechaEmision: pedido.fechaCreacion,
        nombreCliente: pedido.nombreCliente,
        tipo: pedido.tipo,
        direccion: pedido.direccionEntrega,
        items: pedido.items,
        total: pedido.total,
      }

      mostrarFactura(facturaTemp)
    }
  } catch (error) {
    console.error("Error al mostrar detalle de pedido:", error)
    alert(`Error al mostrar detalle de pedido: ${error.message}`)
  }
}

// Función para iniciar simulación
function iniciarSimulacion() {
  if (simulacionActual) {
    return // Ya hay una simulación en curso
  }

  simulacionActual = Activos.iniciarSimulacionAutomatica()

  // Cambiar estado de los botones
  actualizarEstadoBotones()
}

// Función para pausar simulación
function pausarSimulacion() {
  if (!simulacionActual) {
    return // No hay simulación en curso
  }

  simulacionActual.detener()
  simulacionActual = null

  // Cambiar estado de los botones
  actualizarEstadoBotones()
}

// Función para reiniciar simulación
async function reiniciarSimulacion() {
  try {
    // Pausar simulación si está en curso
    if (simulacionActual) {
      simulacionActual.detener()
      simulacionActual = null
    }

    // Reiniciar datos
    const datos = await API.obtenerDatos()

    // Limpiar clientes
    datos.clientes = []

    // Restablecer mesas
    datos.mesas.forEach((mesa) => {
      mesa.disponible = true
      mesa.ocupadaDesde = null
    })

    // Limpiar pedidos y facturas
    datos.pedidos = []
    datos.facturas = []

    // Reiniciar estadísticas
    datos.estadisticas = {
      clientesAtendidos: 0,
      pedidosCompletados: 0,
      ventasTotal: 0,
    }

    // Guardar datos reiniciados
    await API.guardarDatos(datos)

    // Actualizar UI
    await Activos.inicializarDashboard()
    await Activos.renderizarColaClientes()
    await Activos.renderizarPedidosCocina()
    await Activos.renderizarPedidosRecientes()
    await Activos.renderizarPedidosDomicilio()

    // Cambiar estado de los botones
    actualizarEstadoBotones()

    alert("Simulación reiniciada correctamente")
  } catch (error) {
    console.error("Error al reiniciar simulación:", error)
    alert(`Error al reiniciar simulación: ${error.message}`)
  }
}

// Inicializar UI cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", inicializarUI)

// Exportar funciones para módulos ES
export {
  inicializarUI,
  cargarDatosIniciales,
  agregarClienteAleatorio,
  iniciarSimulacion,
  pausarSimulacion,
  reiniciarSimulacion,
}

// Para compatibilidad con el código existente
window.UI = {
  inicializarUI,
  cargarDatosIniciales,
  agregarClienteAleatorio,
  iniciarSimulacion,
  pausarSimulacion,
  reiniciarSimulacion,
}

