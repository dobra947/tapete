/**
 * Motor principal del juego.
 * Gestiona el ciclo de ticks, el estado y la comunicación con el DOM.
 *
 * Estados posibles: 'menu' | 'songSelect' | 'countdown' | 'playing' | 'stopped'
 */

import { levels, QUADRANTS, LIGHT_DURATION, COUNTDOWN_FROM } from '../config/gameConfig.js';
import { randomInt, pickUnique } from './randomizer.js';

export class GameEngine {
  /** @type {'menu'|'songSelect'|'countdown'|'playing'|'stopped'} */
  state = 'menu';

  /** @type {number|null} Nivel seleccionado (1-5) */
  selectedLevel = null;

  /** @type {object|null} Canción seleccionada */
  selectedSong = null;

  /** @type {number|null} ID del intervalo activo */
  #tickInterval = null;

  /** @type {HTMLAudioElement|null} */
  #audio = null;

  /** @type {Map<string, ReturnType<typeof setTimeout>>} Timers de apagado por cuadrante */
  #lightOffTimers = new Map();

  /** @type {Function|null} Callback para notificar cambios de estado a la UI */
  onStateChange = null;

  /** @type {Function|null} Callback cuando un cuadrante se enciende/apaga */
  onQuadrantChange = null;

  // ─── Ciclo de vida ────────────────────────────────────────────────────────

  /**
   * Inicia la cuenta atrás y luego el juego.
   * @param {Function} onTick - Llamado con el número restante cada segundo
   * @returns {Promise<void>} Resuelve cuando la cuenta llega a 0
   */
  startCountdown(onTick) {
    this.#setState('countdown');
    return new Promise((resolve) => {
      let count = COUNTDOWN_FROM;
      onTick(count);
      const timer = setInterval(() => {
        count--;
        onTick(count);
        if (count <= 0) {
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Arranca el motor de juego (audio + ticks de colores).
   */
  startGame() {
    this.#setState('playing');
    this.#playAudio();
    this.#startTicks();
  }

  /**
   * Detiene el juego limpiamente.
   */
  stop() {
    this.#setState('stopped');
    this.#stopTicks();
    this.#stopAudio();
    this.#clearAllLights();
  }

  // ─── Audio ────────────────────────────────────────────────────────────────

  #playAudio() {
    if (!this.selectedSong) return;
    this.#audio = new Audio(this.selectedSong.file);
    this.#audio.loop = true;
    this.#audio.play().catch(() => {
      // Autoplay bloqueado por el navegador: el usuario deberá interactuar primero
      console.warn('Autoplay bloqueado. Esperando interacción del usuario.');
    });
  }

  #stopAudio() {
    if (this.#audio) {
      this.#audio.pause();
      this.#audio.currentTime = 0;
      this.#audio = null;
    }
  }

  // ─── Ticks de color ───────────────────────────────────────────────────────

  #startTicks() {
    const config = levels[this.selectedLevel];
    if (!config) return;

    this.#tickInterval = setInterval(() => {
      this.#processTick(config);
    }, config.interval);
  }

  #stopTicks() {
    if (this.#tickInterval !== null) {
      clearInterval(this.#tickInterval);
      this.#tickInterval = null;
    }
  }

  /**
   * Procesa un tick: determina cuántos colores activar y cuáles.
   * @param {{ interval: number, colorsPerTick: number|number[] }} config
   */
  #processTick(config) {
    const count = Array.isArray(config.colorsPerTick)
      ? config.colorsPerTick[randomInt(0, config.colorsPerTick.length - 1)]
      : config.colorsPerTick;

    const chosen = pickUnique(QUADRANTS, count);
    chosen.forEach((color) => this.#lightUp(color));
  }

  // ─── Iluminación de cuadrantes ────────────────────────────────────────────

  /**
   * Enciende un cuadrante y programa su apagado.
   * @param {string} color
   */
  #lightUp(color) {
    // Cancelar apagado pendiente si ya había uno en curso
    if (this.#lightOffTimers.has(color)) {
      clearTimeout(this.#lightOffTimers.get(color));
    }

    this.onQuadrantChange?.(color, true);

    const timer = setTimeout(() => {
      this.#lightOff(color);
    }, LIGHT_DURATION);

    this.#lightOffTimers.set(color, timer);
  }

  /**
   * Apaga un cuadrante.
   * @param {string} color
   */
  #lightOff(color) {
    this.#lightOffTimers.delete(color);
    this.onQuadrantChange?.(color, false);
  }

  /**
   * Apaga todos los cuadrantes inmediatamente (al detener el juego).
   */
  #clearAllLights() {
    this.#lightOffTimers.forEach((timer) => clearTimeout(timer));
    this.#lightOffTimers.clear();
    QUADRANTS.forEach((color) => this.onQuadrantChange?.(color, false));
  }

  // ─── Estado ───────────────────────────────────────────────────────────────

  /**
   * Cambia el estado interno y notifica a la UI.
   * @param {'menu'|'songSelect'|'countdown'|'playing'|'stopped'} newState
   */
  #setState(newState) {
    this.state = newState;
    this.onStateChange?.(newState);
  }
}
