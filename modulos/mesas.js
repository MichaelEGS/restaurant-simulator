/**
 * Módulo Mesas - Gestión de mesas
 * Este módulo maneja la asignación y liberación de mesas
 */

import * as API from "./api.js"

// Función para obtener todas las mesas
async function obtenerMesas() {
  return await API.obtenerMesas()
}

// Función para obtener mesas disponibles
async function obtenerMesasDisponibles() {
  const mesas = await obtenerMesas()
  return mesas.filter((mesa) => mesa.disponible)
}

// Función para asignar una mesa
async function asignarMesa() {
  const mesasDisponibles = await obtenerMesasDisponibles()

  if (mesasDisponibles.length === 0) {
    return null // No hay mesas disponibles
  }

  // Seleccionar la primera mesa disponible
  const mesaSeleccionada = mesasDisponibles[0]

  // Actualizar estado de la mesa
  const mesas = await obtenerMesas()
  const indice = mesas.findIndex((mesa) => mesa.id === mesaSeleccionada.id)

  mesas[indice].disponible = false
  mesas[indice].ocupadaDesde = new Date().toISOString()

  await API.actualizarMesas(mesas)

  // Notificar a la UI que una mesa ha sido ocupada
  document.dispatchEvent(new CustomEvent("mesaOcupada", { detail: mesas[indice] }))

  return mesas[indice]
}

// Función para liberar una mesa
async function liberarMesa(mesaId) {
  const mesas = await obtenerMesas()
  const indice = mesas.findIndex((mesa) => mesa.id === mesaId)

  if (indice === -1) {
    throw new Error("Mesa no encontrada")
  }

  if (mesas[indice].disponible) {
    return mesas[indice] // La mesa ya está disponible
  }

  // Actualizar estado de la mesa
  mesas[indice].disponible = true
  mesas[indice].ocupadaDesde = null

  await API.actualizarMesas(mesas)

  // Notificar a la UI que una mesa ha sido liberada
  document.dispatchEvent(new CustomEvent("mesaLiberada", { detail: mesas[indice] }))

  return mesas[indice]
}

// Función para obtener una mesa por ID
async function obtenerMesaPorId(mesaId) {
  const mesas = await obtenerMesas()
  return mesas.find((mesa) => mesa.id === mesaId)
}

// Función para calcular el tiempo de ocupación de una mesa
function calcularTiempoOcupacion(mesa) {
  if (!mesa.ocupadaDesde || mesa.disponible) {
    return 0
  }

  const fechaOcupacion = new Date(mesa.ocupadaDesde)
  const ahora = new Date()

  // Calcular diferencia en minutos
  return Math.floor((ahora - fechaOcupacion) / 60000)
}

// Exportar funciones para módulos ES
export { obtenerMesas, obtenerMesasDisponibles, asignarMesa, liberarMesa, obtenerMesaPorId, calcularTiempoOcupacion }

// Para compatibilidad con el código existente
window.Mesas = {
  obtenerMesas,
  obtenerMesasDisponibles,
  asignarMesa,
  liberarMesa,
  obtenerMesaPorId,
  calcularTiempoOcupacion,
}

