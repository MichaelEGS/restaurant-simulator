/**
 * Módulo Clientes - Gestión de clientes
 * Este módulo maneja la creación y gestión de clientes
 */

// Función para generar un ID único para cada cliente
function generarClienteId() {
  return "cliente_" + Date.now() + "_" + Math.floor(Math.random() * 1000)
}

// Función para crear un nuevo cliente
async function crearCliente(nombre, tipo, direccion = null) {
  // Validar datos
  if (!nombre || !tipo) {
    throw new Error("Nombre y tipo de cliente son obligatorios")
  }

  if (tipo === "domicilio" && !direccion) {
    throw new Error("La dirección es obligatoria para pedidos a domicilio")
  }

  // Crear objeto cliente
  const nuevoCliente = {
    id: generarClienteId(),
    nombre,
    tipo,
    direccion: tipo === "domicilio" ? direccion : null,
    fechaRegistro: new Date().toISOString(),
    avatar: `https://placehold.co/40x40/007bff/FFFFFF/png?text=${nombre.charAt(0)}`, // Avatar con la inicial del nombre
  }

  // Guardar cliente en la base de datos
  const clientes = await window.API.obtenerClientes()
  clientes.push(nuevoCliente)
  await window.API.actualizarClientes(clientes)

  return nuevoCliente
}

// Función para obtener un cliente por ID
async function obtenerClientePorId(clienteId) {
  const clientes = await window.API.obtenerClientes()
  return clientes.find((cliente) => cliente.id === clienteId)
}

// Función para actualizar un cliente
async function actualizarCliente(clienteId, datosActualizados) {
  const clientes = await window.API.obtenerClientes()
  const indice = clientes.findIndex((cliente) => cliente.id === clienteId)

  if (indice === -1) {
    throw new Error("Cliente no encontrado")
  }

  // Actualizar datos del cliente
  clientes[indice] = {
    ...clientes[indice],
    ...datosActualizados,
  }

  await window.API.actualizarClientes(clientes)
  return clientes[indice]
}

// Función para eliminar un cliente
async function eliminarCliente(clienteId) {
  const clientes = await window.API.obtenerClientes()
  const nuevosClientes = clientes.filter((cliente) => cliente.id !== clienteId)

  if (nuevosClientes.length === clientes.length) {
    throw new Error("Cliente no encontrado")
  }

  await window.API.actualizarClientes(nuevosClientes)
  return true
}

// Función para añadir cliente a la cola de espera
async function agregarClienteACola(cliente) {
  // En un sistema real, esto podría ser una cola separada
  // Para esta simulación, simplemente marcamos al cliente como "en cola"
  cliente.estado = "en_cola"
  cliente.horaLlegada = new Date().toISOString()

  const clientes = await window.API.obtenerClientes()
  const indice = clientes.findIndex((c) => c.id === cliente.id)

  if (indice !== -1) {
    clientes[indice] = cliente
  } else {
    clientes.push(cliente)
  }

  await window.API.actualizarClientes(clientes)

  // Notificar a la UI que hay un nuevo cliente en cola
  document.dispatchEvent(new CustomEvent("clienteEnCola", { detail: cliente }))

  return cliente
}

// Función para atender al siguiente cliente en la cola
async function atenderSiguienteCliente() {
  const clientes = await window.API.obtenerClientes()

  // Encontrar el primer cliente en cola (ordenado por hora de llegada)
  const clientesEnCola = clientes
    .filter((cliente) => cliente.estado === "en_cola")
    .sort((a, b) => new Date(a.horaLlegada) - new Date(b.horaLlegada))

  if (clientesEnCola.length === 0) {
    return null // No hay clientes en cola
  }

  const clienteAtender = clientesEnCola[0]
  clienteAtender.estado = "siendo_atendido"
  clienteAtender.horaAtencion = new Date().toISOString()

  // Actualizar el cliente en la base de datos
  const indice = clientes.findIndex((c) => c.id === clienteAtender.id)
  clientes[indice] = clienteAtender
  await window.API.actualizarClientes(clientes)

  // Notificar a la UI que un cliente está siendo atendido
  document.dispatchEvent(new CustomEvent("clienteAtendido", { detail: clienteAtender }))

  return clienteAtender
}

// Exportar funciones para que sean accesibles desde otros módulos
export {
  generarClienteId,
  crearCliente,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
  agregarClienteACola,
  atenderSiguienteCliente,
}

// Para compatibilidad con el código existente
window.Clientes = {
  crearCliente,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
  agregarClienteACola,
  atenderSiguienteCliente,
}

