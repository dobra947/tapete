/**
 * Utilidades de aleatoriedad para el motor del juego.
 * Aisladas aquí para facilitar testing y reutilización.
 */

/**
 * Devuelve un entero aleatorio entre min y max (inclusive).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Mezcla un array usando Fisher-Yates (in-place).
 * @param {Array} array
 * @returns {Array} el mismo array mezclado
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Selecciona `count` elementos únicos aleatorios de `pool`.
 * Nunca devuelve duplicados en un mismo tick.
 * @param {Array} pool - Elementos disponibles
 * @param {number} count - Cuántos seleccionar
 * @returns {Array}
 */
export function pickUnique(pool, count) {
  const safe = Math.min(count, pool.length);
  return shuffle([...pool]).slice(0, safe);
}
