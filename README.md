# Juego Tapete

Juego web interactivo de cuadrantes de colores construido con Astro.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

Abre `http://localhost:4321` en el navegador.

## Producción

### 1. Generar el build

```bash
npm run build
```

Los archivos estáticos se generan en `/dist`.

### 2. Opciones de despliegue

#### Vercel

```bash
npm i -g vercel
vercel
```

#### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Servidor propio (nginx, apache, cualquier hosting estático)

Copia el contenido de `/dist` al directorio público de tu servidor. No requiere Node en producción — son archivos HTML/CSS/JS estáticos.

#### Vista previa local del build

```bash
npm run preview
```

Abre `http://localhost:4321` con los archivos del build, no del código fuente.

## Agregar canciones

1. Copia los archivos `.mp3` en `/public/audio/`
2. Regístralos en `src/config/songsConfig.js`:

```js
export const songs = [
  { id: 1, name: "Nombre visible", file: "/audio/archivo.mp3" },
];
```

## Ajustar niveles

Edita `src/config/gameConfig.js`. Todos los parámetros del juego están centralizados ahí.
