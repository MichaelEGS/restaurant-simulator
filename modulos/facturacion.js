/**
 * Módulo Facturación - Generación de facturas
 * Este módulo maneja la creación y gestión de facturas
 */

// Función para generar un ID único para cada factura
function generarFacturaId() {
    return "factura_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
  }
  
  // Función para generar una factura a partir de un pedido
  async function generarFactura(pedido) {
    // Validar que el pedido exista
    if (!pedido) {
      throw new Error("Pedido no válido")
    }
  
    // Obtener cliente
    const cliente = await window.Clientes.obtenerClientePorId(pedido.clienteId)
  
    // Crear objeto factura
    const nuevaFactura = {
      id: generarFacturaId(),
      pedidoId: pedido.id,
      numeroOrden: pedido.numeroOrden,
      clienteId: pedido.clienteId,
      nombreCliente: cliente ? cliente.nombre : pedido.nombreCliente,
      tipo: pedido.tipo,
      direccion: cliente ? cliente.direccion : null,
      items: pedido.items,
      total: pedido.total,
      fechaEmision: new Date().toISOString(),
      estado: "emitida",
    }
  
    // Guardar factura en la base de datos
    const facturas = await window.API.obtenerFacturas()
    facturas.push(nuevaFactura)
    await window.API.actualizarFacturas(facturas)
  
    // Notificar a la UI que se ha generado una nueva factura
    document.dispatchEvent(new CustomEvent("nuevaFactura", { detail: nuevaFactura }))
  
    return nuevaFactura
  }
  
  // Función para obtener una factura por ID
  async function obtenerFacturaPorId(facturaId) {
    const facturas = await window.API.obtenerFacturas()
    return facturas.find((factura) => factura.id === facturaId)
  }
  
  // Función para obtener facturas por cliente
  async function obtenerFacturasPorCliente(clienteId) {
    const facturas = await window.API.obtenerFacturas()
    return facturas.filter((factura) => factura.clienteId === clienteId)
  }
  
  // Función para marcar una factura como pagada
  async function marcarFacturaPagada(facturaId) {
    const facturas = await window.API.obtenerFacturas()
    const indice = facturas.findIndex((factura) => factura.id === facturaId)
  
    if (indice === -1) {
      throw new Error("Factura no encontrada")
    }
  
    // Actualizar estado de la factura
    facturas[indice].estado = "pagada"
    facturas[indice].fechaPago = new Date().toISOString()
  
    await window.API.actualizarFacturas(facturas)
  
    // Notificar a la UI que una factura ha sido pagada
    document.dispatchEvent(new CustomEvent("facturaPagada", { detail: facturas[indice] }))
  
    return facturas[indice]
  }
  
  // Función para obtener facturas por estado
  async function obtenerFacturasPorEstado(estado) {
    const facturas = await window.API.obtenerFacturas()
    return facturas.filter((factura) => factura.estado === estado)
  }
  
  // Función para formatear el total de la factura
  function formatearTotal(total) {
    return "$" + total.toFixed(2)
  }
  
  // Exportar funciones para módulos ES
  export {
    generarFactura,
    obtenerFacturaPorId,
    obtenerFacturasPorCliente,
    marcarFacturaPagada,
    obtenerFacturasPorEstado,
    formatearTotal,
  }
  
  // Para compatibilidad con el código existente
  window.Facturacion = {
    generarFactura,
    obtenerFacturaPorId,
    obtenerFacturasPorCliente,
    marcarFacturaPagada,
    obtenerFacturasPorEstado,
    formatearTotal,
  }
  
  