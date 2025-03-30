/**
 * Módulo Tiempo - Cálculo de tiempos
 * Este módulo maneja el cálculo de tiempos de preparación y entrega
 */

// Función para calcular el tiempo total de preparación basado en los items del pedido
async function calcularTiempoPreparacion(items) {
  // Obtener el menú completo
  const menu = await window.API.obtenerMenu()

  // Aplanar todas las categorías del menú en un solo array
  const todosLosItems = [...menu.combos, ...menu.pizzas, ...menu.bebidas]

  // Calcular el tiempo de preparación para cada item
  let tiempoTotal = 0

  for (const item of items) {
    const menuItem = todosLosItems.find((mi) => mi.id === item.id)
    if (menuItem) {
      // El tiempo de preparación de múltiples unidades no es lineal
      // Por ejemplo, preparar 2 pizzas no toma el doble de tiempo que 1
      const factorCantidad = Math.sqrt(item.cantidad)
      tiempoTotal += menuItem.tiempoPreparacion * factorCantidad
    }
  }

  // Redondear al entero más cercano
  return Math.round(tiempoTotal)
}

// Función para calcular el tiempo estimado de entrega
async function calcularTiempoEntrega(pedido) {
  // El tiempo de entrega es el tiempo actual + tiempo de preparación + tiempo adicional
  const ahora = new Date()

  // Tiempo adicional dependiendo del tipo de pedido
  let tiempoAdicional = 0

  if (pedido.tipo === "domicilio") {
    // Para domicilio, añadir tiempo de entrega (entre 15-30 minutos)
    tiempoAdicional = 0.60 + Math.floor(Math.random() * 0.6)
  } else {
    // Para local, añadir un pequeño tiempo de servicio
    tiempoAdicional = 0.8
  }

  // Calcular tiempo total en minutos
  const tiempoTotalMinutos = pedido.tiempoPreparacion + tiempoAdicional

  // Crear fecha de entrega estimada
  const fechaEntrega = new Date(ahora.getTime() + tiempoTotalMinutos * 60000)

  return fechaEntrega.toISOString()
}

// Función para simular el progreso de preparación de un pedido
function simularProgresoPreparacion(pedidoId, tiempoTotal, callbackProgreso, callbackCompletado) {
  // Convertir tiempo total a milisegundos
  const tiempoTotalMs = tiempoTotal * 60000

  // Intervalo de actualización (cada 1 segundo)
  const intervaloActualizacion = 1000

  // Tiempo transcurrido
  let tiempoTranscurrido = 0

  // Iniciar intervalo
  const intervalo = setInterval(() => {
    tiempoTranscurrido += intervaloActualizacion

    // Calcular progreso (0-100%)
    const progreso = Math.min(100, Math.round((tiempoTranscurrido / tiempoTotalMs) * 100))

    // Llamar al callback de progreso
    if (callbackProgreso) {
      callbackProgreso(pedidoId, progreso)
    }

    // Si se completó el tiempo, detener intervalo y llamar al callback de completado
    if (progreso >= 100) {
      clearInterval(intervalo)
      if (callbackCompletado) {
        callbackCompletado(pedidoId)
      }
    }
  }, intervaloActualizacion)

  // Devolver una función para cancelar la simulación si es necesario
  return {
    cancelar: () => clearInterval(intervalo),
  }
}

// Función para formatear tiempo restante
function formatearTiempoRestante(fechaEntrega) {
  const ahora = new Date()
  const fechaEntregaDate = new Date(fechaEntrega)

  // Calcular diferencia en minutos
  const diferenciaMs = fechaEntregaDate.getTime() - ahora.getTime()

  if (diferenciaMs <= 0) {
    return "Listo para entregar"
  }

  const minutos = Math.floor(diferenciaMs / 60000)

  if (minutos < 1) {
    return "Menos de 1 minuto"
  } else if (minutos === 1) {
    return "1 minuto"
  } else {
    return `${minutos} minutos`
  }
}

// Exportar funciones para módulos ES
export { calcularTiempoPreparacion, calcularTiempoEntrega, simularProgresoPreparacion, formatearTiempoRestante }

// Para compatibilidad con el código existente
window.Tiempo = {
  calcularTiempoPreparacion,
  calcularTiempoEntrega,
  simularProgresoPreparacion,
  formatearTiempoRestante,
}

