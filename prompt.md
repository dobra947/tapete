Quiero crear un juego web interactivo usando Astro.

DESCRIPCIÓN DEL JUEGO:
La pantalla está dividida en 4 cuadrantes:
- Arriba izquierda: amarillo
- Arriba derecha: azul
- Abajo izquierda: verde
- Abajo derecha: rojo

FLUJO DEL JUEGO:
1. Pantalla inicial:
    - Selector de nivel (1 al 5)
2. Pantalla de selección de canción:
    - Lista de canciones (definida en config)
3. Al seleccionar canción:
    - Cuenta atrás visual: 5 → 0
4. Inicio del juego:
    - Pantalla negra
    - Se reproducirá la canción seleccionada
    - Se activan los colores en los cuadrantes según el nivel

MECÁNICA DE LOS NIVELES:
- Nivel 1:
    - Se enciende 1 color aleatorio cada 1500ms
- Nivel 2:
    - 1 color cada 1000ms
- Nivel 3:
    - 1 color cada 500ms
- Nivel 4:
    - Cada 500ms se activan 2 colores aleatorios simultáneamente
    - Si se repite color, solo se muestra una vez
- Nivel 5:
    - Cada 250ms
    - Se activan entre 1 y 3 colores aleatorios

COMPORTAMIENTO DE LOS COLORES:
- Cada color se enciende no suavemente (fade-in)
- Permanece visible ~1 segundo (configurable)
- Luego se apaga no suavemente(fade-out)
- El orden es completamente aleatorio

REQUISITOS TÉCNICOS:
- Usar Astro como base
- Lógica en JavaScript modular
- No usar frameworks pesados (React solo si es necesario)
- Animaciones con CSS (transitions o keyframes)
- Código limpio, escalable y bien comentado

ESTRUCTURA DEL PROYECTO:
- /pages/index.astro
- /components/
    - LevelSelector
    - SongSelector
    - Countdown
    - GameBoard
- /scripts/
    - gameEngine.js
    - randomizer.js
- /config/
    - gameConfig.js
    - songsConfig.js

CONFIGURACIÓN (MUY IMPORTANTE):
Toda la lógica de niveles debe estar en un archivo:

/config/gameConfig.js

Ejemplo esperado:
export const levels = {
1: { interval: 1500, colorsPerTick: 1 },
2: { interval: 1000, colorsPerTick: 1 },
3: { interval: 500, colorsPerTick: 1 },
4: { interval: 500, colorsPerTick: 2 },
5: { interval: 250, colorsPerTick: [1,2,3] }
};

También:
- duración del encendido
- delays
- animaciones

LISTA DE CANCIONES:
Debe estar en:
/config/songsConfig.js

Ejemplo:
export const songs = [
{ id: 1, name: "Song 1", file: "/audio/song1.mp3" },
{ id: 2, name: "Song 2", file: "/audio/song2.mp3" }
];

REQUISITOS EXTRA:
- Usar Math.random() para generar combinaciones
- Evitar duplicados en un mismo tick
- Sistema de estados (menu, selección, countdown, playing)
- Código preparado para añadir scoring en el futuro

OBJETIVO:
Quiero un prototipo funcional, limpio y fácilmente ampliable.
No necesito backend.
Priorizar claridad del código sobre optimización extrema.