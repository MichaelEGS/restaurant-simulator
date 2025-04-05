/**
 * Módulo Tiempo - Cálculo de tiempos
 * Este módulo maneja el cálculo de tiempos de preparación y entrega en segundos,
 * garantizando que el tiempo total se encuentre en el rango de 15 a 45 segundos.
 */

// Función para calcular el tiempo total de preparación basado en los items del pedido
async function calcularTiempoPreparacion(items) {
    // Obtener el menú completo
    const menu = await window.API.obtenerMenu();
    
    // Aplanar todas las categorías del menú en un solo array
    const todosLosItems = [...menu.combos, ...menu.pizzas, ...menu.bebidas];
    
    // Calcular el tiempo de preparación para cada item
    let tiempoTotal = 0;
    for (const item of items) {
      const menuItem = todosLosItems.find((mi) => mi.id === item.id);
      if (menuItem) {
        // El tiempo de preparación de múltiples unidades no es lineal
        // Por ejemplo, preparar 2 pizzas no toma el doble de tiempo que 1
        const factorCantidad = Math.sqrt(item.cantidad);
        tiempoTotal += menuItem.tiempoPreparacion * factorCantidad;
      }
    }
    
    // Convertir el tiempo total a segundos (asumiendo que menuItem.tiempoPreparacion estaba en minutos)
    let tiempoTotalSegundos = tiempoTotal * 60;
    // Limitar el tiempo total al rango de 15 a 45 segundos
    tiempoTotalSegundos = Math.max(15, Math.min(45, Math.round(tiempoTotalSegundos)));
    
    return tiempoTotalSegundos;
  }
    
  // Función para calcular el tiempo estimado de entrega
  async function calcularTiempoEntrega(pedido) {
    const ahora = new Date();
    
    // Para pedidos a domicilio, se añade un tiempo adicional aleatorio sin exceder los 45 seg totales
    let tiempoAdicional = 0;
    if (pedido.tipo === "domicilio") {
      // Calcular el máximo adicional permitido para que el total no supere 45 seg
      const maxAdicional = 45 - pedido.tiempoPreparacion;
      tiempoAdicional = Math.floor(Math.random() * (maxAdicional + 1)); // valor aleatorio entre 0 y maxAdicional
    } else {
      tiempoAdicional = 0;
    }
    
    // El tiempo total de entrega es la suma del tiempo de preparación y el tiempo adicional
    const tiempoTotalSegundos = pedido.tiempoPreparacion + tiempoAdicional;
    
    // Calcular la fecha estimada de entrega
    const fechaEntrega = new Date(ahora.getTime() + tiempoTotalSegundos * 1000);
    
    return fechaEntrega.toISOString();
  }
    
  // Función para simular el progreso de preparación de un pedido
  function simularProgresoPreparacion(pedidoId, tiempoTotal, callbackProgreso, callbackCompletado) {
    // Convertir tiempo total (en segundos) a milisegundos
    const tiempoTotalMs = tiempoTotal * 1000;
    const intervaloActualizacion = 1000; // actualiza cada 1 segundo
    let tiempoTranscurrido = 0;
    
    const intervalo = setInterval(() => {
      tiempoTranscurrido += intervaloActualizacion;
      
      // Calcular progreso (0-100%)
      const progreso = Math.min(100, Math.round((tiempoTranscurrido / tiempoTotalMs) * 100));
      
      if (callbackProgreso) {
        callbackProgreso(pedidoId, progreso);
      }
      
      if (progreso >= 100) {
        clearInterval(intervalo);
        if (callbackCompletado) {
          callbackCompletado(pedidoId);
        }
      }
    }, intervaloActualizacion);
    
    // Devolver una función para cancelar la simulación si es necesario
    return {
      cancelar: () => clearInterval(intervalo),
    };
  }
    
  // Función para formatear el tiempo restante hasta la entrega
  function formatearTiempoRestante(fechaEntrega) {
    const ahora = new Date();
    const fechaEntregaDate = new Date(fechaEntrega);
    const diferenciaMs = fechaEntregaDate.getTime() - ahora.getTime();
    
    if (diferenciaMs <= 0) {
      return "Listo para entregar";
    }
    
    const segundosRestantes = Math.ceil(diferenciaMs / 1000);
    return `${segundosRestantes} seg restantes`;
  }
    
  // Exportar funciones para su uso en otros módulos
  export {
    calcularTiempoPreparacion,
    calcularTiempoEntrega,
    simularProgresoPreparacion,
    formatearTiempoRestante,
  };
  
  // Para compatibilidad con el código existente
  window.Tiempo = {
    calcularTiempoPreparacion,
    calcularTiempoEntrega,
    simularProgresoPreparacion,
    formatearTiempoRestante,
  };
  