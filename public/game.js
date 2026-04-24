// ─── Randomizer ───────────────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function pickUnique(pool, count) {
  return shuffle([...pool]).slice(0, Math.min(count, pool.length));
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_QUADRANTS = {
  colors:  ['yellow', 'blue', 'green', 'red'],
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  shapes:  ['square', 'circle', 'triangle', 'rectangle'],
};

const COUNTDOWN_FROM = 5;
const LEVELS = {
  1: { interval: 3000, colorsPerTick: 1 },
  2: { interval: 2000, colorsPerTick: 1 },
  3: { interval: 1000, colorsPerTick: 1 },
  4: { interval: 1000, colorsPerTick: 2 },
  5: { interval: 1000, colorsPerTick: [1, 2, 3] },
};

// ─── Estado ───────────────────────────────────────────────────────────────────

const game = {
  selectedType: null,
  selectedLevel: null,
  selectedSong: null,
  tickInterval: null,
  audio: null,
  lightOffTimers: {},
  lastColors: [],
};

// ─── Init (espera a que el DOM esté listo) ────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {

  const songsData = JSON.parse(document.getElementById('songs-data').textContent);

  // ─── Pantallas ─────────────────────────────────────────────────────────────

  function showOnly(screenId) {
    ['type-selector', 'level-selector', 'song-selector', 'countdown', 'game-board'].forEach(function (id) {
      var el = document.getElementById(id);
      if (id === screenId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  }

  function showBoardType(type) {
    ['board-colors', 'board-numbers', 'board-shapes'].forEach(function (id) {
      document.getElementById(id).classList.toggle('hidden', 'board-' + type !== id);
    });
  }

  // ─── Cuadrantes ────────────────────────────────────────────────────────────

  function getQuadrants() {
    return TYPE_QUADRANTS[game.selectedType] || TYPE_QUADRANTS.colors;
  }

  function lightUp(id, duration) {
    if (game.lightOffTimers[id]) clearTimeout(game.lightOffTimers[id]);
    document.getElementById('q-' + id).classList.add('active');
    game.lightOffTimers[id] = setTimeout(function () {
      document.getElementById('q-' + id).classList.remove('active');
      delete game.lightOffTimers[id];
    }, duration);
  }

  function clearAllLights() {
    Object.values(game.lightOffTimers).forEach(clearTimeout);
    game.lightOffTimers = {};
    getQuadrants().forEach(function (id) {
      document.getElementById('q-' + id).classList.remove('active');
    });
  }

  // ─── Ticks ─────────────────────────────────────────────────────────────────

  function startTicks() {
    var config = LEVELS[game.selectedLevel];
    game.tickInterval = setInterval(function () {
      var count = Array.isArray(config.colorsPerTick)
        ? config.colorsPerTick[randomInt(0, config.colorsPerTick.length - 1)]
        : config.colorsPerTick;

      var quadrants = getQuadrants();
      var pool;
      if (game.selectedLevel <= 3) {
        // Niveles 1-2-3: el cuadrante no puede repetir el del tick anterior
        pool = quadrants.filter(function (id) { return game.lastColors.indexOf(id) === -1; });
        if (pool.length < count) pool = quadrants.slice();
      } else {
        // Niveles 4-5: cualquier cuadrante puede salir
        pool = quadrants.slice();
      }

      var chosen = pickUnique(pool, count);
      game.lastColors = chosen;

      chosen.forEach(function (id) {
        lightUp(id, config.interval);
      });
    }, config.interval);
  }

  function stopTicks() {
    clearInterval(game.tickInterval);
    game.tickInterval = null;
  }

  // ─── Audio ─────────────────────────────────────────────────────────────────

  function playAudio() {
    if (!game.selectedSong) return;
    game.audio = new Audio(game.selectedSong.file);
    game.audio.addEventListener('ended', stopGame);
    game.audio.play().catch(function () {});
  }

  function stopAudio() {
    if (game.audio) {
      game.audio.pause();
      game.audio = null;
    }
  }

  // ─── Countdown ─────────────────────────────────────────────────────────────

  function runCountdown() {
    return new Promise(function (resolve) {
      var el = document.getElementById('countdown-number');
      var count = COUNTDOWN_FROM;

      function update(n) {
        el.textContent = n === 0 ? '¡YA!' : String(n);
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = '';
      }

      update(count);
      var timer = setInterval(function () {
        count--;
        update(count);
        if (count <= 0) {
          clearInterval(timer);
          setTimeout(resolve, 600);
        }
      }, 1000);
    });
  }

  // ─── Flujo ─────────────────────────────────────────────────────────────────

  // 0. Selector de tipo de juego
  document.querySelectorAll('.type-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      game.selectedType = btn.dataset.type;
      showOnly('level-selector');
    });
  });

  // Volver al selector de tipo desde el selector de nivel
  document.getElementById('level-back-btn').addEventListener('click', function () {
    showOnly('type-selector');
  });

  // 1. Botones de nivel
  document.querySelectorAll('.level-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      game.selectedLevel = parseInt(btn.dataset.level, 10);
      populateSongs();
      showOnly('song-selector');
    });
  });

  // 2. Lista de canciones
  function populateSongs() {
    var list = document.getElementById('song-list');
    list.innerHTML = '';
    songsData.forEach(function (song) {
      var btn = document.createElement('button');
      btn.className = 'song-item';
      btn.textContent = song.name;
      btn.addEventListener('click', function () { selectSong(song); });
      list.appendChild(btn);
    });
  }

  // 3. Canción → countdown → juego
  function selectSong(song) {
    game.selectedSong = song;
    showOnly('countdown');
    runCountdown().then(function () {
      showBoardType(game.selectedType);
      showOnly('game-board');
      playAudio();
      startTicks();
    });
  }

  function stopGame() {
    stopTicks();
    stopAudio();
    clearAllLights();
    game.lastColors = [];
    showOnly('level-selector');
  }

  // Volver al menú de nivel
  document.getElementById('song-back-btn').addEventListener('click', function () {
    showOnly('level-selector');
  });

  // Detener juego
  document.getElementById('stop-btn').addEventListener('click', stopGame);

  // Estado inicial
  showOnly('type-selector');
});
