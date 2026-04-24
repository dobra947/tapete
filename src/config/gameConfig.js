/**
 * Configuración central del juego.
 * Modificar aquí para ajustar comportamiento sin tocar la lógica.
 */

// Duración total del juego en ms
export const GAME_DURATION = 30000;

// Definición de los cuadrantes disponibles
export const QUADRANTS = ['yellow', 'blue', 'green', 'red'];

// Configuración por nivel: intervalo entre ticks y cantidad de colores por tick
export const levels = {
  1: { interval: 4000, colorsPerTick: 1 },
  2: { interval: 3000, colorsPerTick: 1 },
  3: { interval: 2000,  colorsPerTick: 1 },
  4: { interval: 1000,  colorsPerTick: 2 },
  5: { interval: 1000,  colorsPerTick: [1, 2, 3] }, // cantidad aleatoria entre 1 y 3
};

// Duración de la cuenta atrás en segundos
export const COUNTDOWN_FROM = 5;

// Preparado para sistema de scoring futuro
export const SCORING = {
  enabled: false,
  pointsPerHit: 10,
  combo: false,
};
