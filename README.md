# Portfolio · Santiago Pérez Mejías

Sitio web de Santiago Pérez Mejías, productor audiovisual. Es una home (portada, sobre mí, trabajos y contacto) más una página para cada proyecto.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · framer-motion · React Router 8. Todo en JavaScript (JSX).

## Para arrancar

Necesitás **Node 22.22 o superior** (lo pide React Router 8).

```bash
npm install
npm run dev       # servidor local en http://localhost:5173
npm run build     # compila a /dist
npm run preview   # sirve lo compilado para revisarlo
npm run lint      # revisa el código con ESLint
```

## Estructura

```
portfolio-spm/
├── index.html              ← título, descripción y vista previa para compartir el link
├── vercel.json             ← rutas de la SPA y caché de archivos en Vercel
├── .env                    ← VITE_SITE_URL (dominio del sitio)
├── public/
│   ├── og.jpg              ← imagen que aparece al compartir el link (1200×630)
│   ├── favicon-16.png · favicon-32.png · apple-touch-icon.png · icon-192/512.png
│   ├── site.webmanifest
│   └── media/              ← acá van las fotos y videos de cada proyecto
└── src/
    ├── data/
    │   ├── site.js         ← textos de la home, sobre mí y contacto
    │   └── projects.js     ← los 5 proyectos con todo su contenido
    ├── assets/             ← retratos de Santi (WebP optimizados)
    ├── components/         ← piezas reutilizables (encabezado, carrusel, cinta, trama…)
    ├── sections/
    │   ├── home/           ← Hero, About, Works, Contact
    │   └── project/        ← portada, visor, ficha, afiche, tareas, créditos, siguiente
    ├── pages/              ← Home, Project y NotFound (404)
    ├── hooks/              ← manejo del scroll entre páginas y título de la pestaña
    ├── lib/tokens.js       ← colores y curva de animación para estilos dinámicos
    ├── index.css           ← paleta, tipografías y utilidades (config de Tailwind v4)
    ├── App.jsx             ← rutas y transición entre páginas
    └── main.jsx
```

## Cómo cambiar el contenido

Todo el texto vive en `src/data/`, así que no hace falta tocar componentes:

- **`site.js`**: nombre, rol, frase, palabras de la cinta, sobre mí, ficha (formación, idiomas…) y contacto. El mensaje que aparece escrito al abrir WhatsApp también está ahí.
- **`projects.js`**: cada proyecto genera su página en `/proyectos/<slug>`. El orden de la lista es el orden en la home y en "Siguiente proyecto".

Lo que está **entre [corchetes] es un dato que falta**: se ve tal cual en la web hasta que se complete.

### Fotos y videos

1. Copiá los archivos en `public/media/<slug-del-proyecto>/`.
2. Escribí la ruta en `projects.js`. Ejemplos:

```js
media: {
  clip: '/media/el-club-debede/clip.mp4',      // video principal en loop
  poster: '/media/el-club-debede/afiche.jpg',  // afiche (4:5)
  cover: '/media/el-club-debede/portada.jpg',  // tarjeta de la home (4:5)
},
gallery: [
  { type: 'photo', title: 'El armado', src: '/media/el-club-debede/armado.jpg', caption: 'Cómo se hizo…' },
  { type: 'clip', title: 'El show', src: '/media/el-club-debede/show.mp4' },
],
```

Mientras un campo esté en `null`, se muestra la trama de puntos del diseño.

**Formatos recomendados**

| Pieza | Formato | Medida | Notas |
| --- | --- | --- | --- |
| Clip principal | MP4 (H.264), sin sonido | 1920 px de ancho | 10 a 15 s, menos de 6 MB |
| Clips del carrusel | MP4 (H.264), sin sonido | 1080×1350 (4:5) | 10 a 15 s, menos de 4 MB |
| Fotos | JPG o WebP | 1080×1350 (4:5) | menos de 400 KB |
| Afiche y portada | JPG o WebP | 1080×1350 (4:5) | |

Los clips se reproducen solos, en silencio y en bucle. Si el sistema tiene activado "reducir movimiento", no arrancan solos.

Los retratos de la portada están en `src/assets/`. Para cambiarlos, reemplazá los archivos manteniendo los nombres.

## Diseño

- **Paleta** (`src/index.css`, bloque `@theme`): negro `#0B0B0B`, hueso `#ECE6DA` y rojo `#C4301F`. Si cambiás un color ahí, cambia en todo el sitio.
- **Tipografías**: Anton para los títulos y Space Mono para los textos. Se sirven desde el propio sitio con `@fontsource`, sin depender de Google.
- **Utilidades propias**: `display`, `eyebrow`, los cortes en ángulo (`cut-*`), `knockout` (contorno para que se lean las tildes de Anton en títulos de varias líneas) y `.halo` (el borde granulado del nombre de la portada).

## Animaciones (framer-motion)

- **Portada:** el nombre entra línea por línea y las dos fotos de Santi se alternan con un fundido.
- **Secciones:** aparecen al entrar en pantalla.
- **Entre páginas:** hay un fundido al pasar de la home a un proyecto y al volver.
- **Trabajos:** en escritorio, el visor cambia al pasar el cursor por cada proyecto.
- **Carrusel de clips y fotos:**
  - Muestra 3 a la vez en escritorio, 2 en tablet y 1 en celular.
  - Avanza solo cada 4 segundos, en bucle.
  - Se frena con el cursor encima, al enfocarlo, cuando no está en pantalla o con el botón de pausa.
  - Se puede arrastrar con el dedo o el mouse, o mover con las flechas del teclado.
- **Movimiento reducido:** con la opción "reducir movimiento" del sistema activada, se apagan los desplazamientos y el avance automático.

## Publicar en Vercel

1. Subí el proyecto a un repositorio de GitHub.
2. En Vercel: **Add New → Project**, elegí el repo. Detecta Vite solo (build `npm run build`, salida `dist`).
3. En **Settings → Environment Variables**, cargá `VITE_SITE_URL` con el dominio final, sin barra al final (por ejemplo `https://santiagoperezmejias.com`). Lo usa la vista previa del link en WhatsApp, Instagram y LinkedIn.
4. `vercel.json` ya hace que las rutas `/proyectos/...` funcionen al recargar la página.

## Pendientes de contenido

- **Años:** de El Club Debede (el documento lo marca para completar), Rodajes y producciones, Televisión Barata y Shows y festivales.
- **Material de cada proyecto:** fotos, clips, afiches y portadas.
- **El Club Debede:**
  - Bandas y bares para los créditos.
  - Confirmar si lleva el "El" en el nombre (en el documento figura "Club Debede").
- **Rodajes y producciones:** los rodajes de la facultad y el rol en cada uno.
- **Gonna Go:** qué es y qué tareas hacía Santi.
- **Televisión Barata:** el rol de Santi en cada emisión y el equipo.
- **Shows y festivales:** otros festivales, aparte de Lollapalooza Argentina.
- **Datos decorativos del visor:** "4K · 25 FPS" y el código de tiempo. Confirmar con qué filma Santi o sacarlos.
- **Botón "Reel":** hoy lleva a la sección de trabajos porque todavía no hay reel.
- **Dominio:** definirlo y cargarlo en `VITE_SITE_URL`.
