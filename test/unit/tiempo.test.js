const { calcularTiempoPreparacion } = require('../modulos/tiempo');

describe('Módulo Tiempo', () => {
  const itemsValidos = [
    { id: 'combo1', cantidad: 2 },
    { id: 'pizza1', cantidad: 1 }
  ];

  test('Calcula tiempo de preparación no lineal', async () => {
    const tiempo = await calcularTiempoPreparacion(itemsValidos);
    // combo1: 20min * sqrt(2) ≈ 28.28
    // pizza1: 18min * sqrt(1) = 18
    // Total ≈ 46.28 ≈ 46
    expect(tiempo).toBe(46);
  });

  test('Maneja items no encontrados', async () => {
    const itemsInvalidos = [{ id: 'no-existe', cantidad: 1 }];
    await expect(calcularTiempoPreparacion(itemsInvalidos))
      .rejects.toThrow('Item no encontrado en el menú');
  });
});