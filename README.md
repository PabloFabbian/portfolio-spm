# Portfolio · Santiago Pérez Mejías

Sitio web de Santiago Pérez Mejías, productor audiovisual: una home (portada, sobre mí, trabajos y contacto) y una página por proyecto.

**Para cambiar textos, fotos o videos no hace falta saber programar:** está todo explicado en **[COMO-EDITAR.md](COMO-EDITAR.md)**.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · framer-motion · React Router 8. JavaScript (JSX).

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
├── COMO-EDITAR.md          ← guía para editar el contenido (para Santi)
├── contenido/              ← TODO el contenido editable
│   ├── sitio.js            ← textos de portada, sobre mí y contacto
│   ├── proyectos.js        ← textos de cada proyecto (el orden es el de la web)
│   ├── fotos/              ← portada-1, portada-2, sobre-mi
│   └── proyectos/<carpeta>/← tarjeta, video-principal, imagen-principal, afiche, galeria-N
├── public/
│   ├── imagen-para-compartir.jpg   ← vista previa al compartir el link (1200×630)
│   └── favicon-16/32, apple-touch-icon, icon-192/512, site.webmanifest
├── src/
│   ├── data/               ← traduce `contenido/` al formato que usan los componentes
│   │   ├── site.js · projects.js
│   │   └── media.js        ← detecta fotos y videos por nombre de archivo
│   ├── components/         ← encabezado, carrusel, cinta, trama de puntos, transición…
│   ├── sections/home/      ← Hero, About, Works, Contact
│   ├── sections/project/   ← portada, visor, ficha, afiche, tareas, créditos, siguiente
│   ├── pages/              ← Home, Project y NotFound (404)
│   ├── hooks/              ← scroll entre páginas y título de la pestaña
│   ├── lib/tokens.js       ← colores y curva de animación para estilos dinámicos
│   ├── index.css           ← paleta, tipografías y utilidades (config de Tailwind v4)
│   └── App.jsx · main.jsx
├── index.html · vite.config.js · eslint.config.js · vercel.json · .env
```

## Cómo funciona el contenido

- **Textos:** `contenido/sitio.js` y `contenido/proyectos.js` usan nombres en castellano (`frase`, `bajada`, `ficha`, `galeria`…) y llevan comentarios para editarlos sin saber código. `src/data/site.js` y `src/data/projects.js` los traducen a lo que usan los componentes y completan valores por defecto si falta algún campo.
- **Fotos y videos:** se detectan con `import.meta.glob` según el nombre del archivo, sin importar mayúsculas ni extensión (`src/data/media.js`). Si hay dos archivos con el mismo nombre, gana `.jpg/.jpeg/.png` sobre `.webp`. Vite los procesa y les agrega un hash al compilar.
- **Avisos de lo que falta:** mientras falte un archivo, la web muestra un aviso del estilo **[Falta afiche.jpg]** con el nombre exacto que hay que subir.
- **Galería:** las piezas de `galeria.piezas` se cruzan con `galeria-1`, `galeria-2`… Si hay archivos de más, se agregan solos. Foto o video se decide por la extensión del archivo.

## Diseño

- **Paleta** (`src/index.css`, bloque `@theme`): negro `#0B0B0B`, hueso `#ECE6DA` y rojo `#C4301F`. Si cambiás un color ahí, cambia en todo el sitio.
- **Tipografías:** Anton para los títulos y Space Mono para los textos. Se sirven desde el propio sitio con `@fontsource`, sin depender de Google.
- **Utilidades propias:**
  - `display` y `eyebrow`.
  - Los cortes en ángulo (`cut-*`).
  - `knockout`: contorno del color del fondo para que se lean las tildes de Anton en títulos de varias líneas.
  - `.halo`: el borde granulado del nombre de la portada.

## Animaciones (framer-motion)

- **Portada:** el nombre entra línea por línea y las dos fotos de la portada se alternan con un fundido.
- **Secciones:** aparecen al entrar en pantalla.
- **Entre páginas:** fundido al pasar de una página a otra. Al volver atrás, el scroll queda donde estaba.
- **Trabajos:** en escritorio, el visor cambia al pasar el cursor por cada proyecto.
- **Carrusel de clips y fotos:**
  - Muestra 3 a la vez en escritorio, 2 en tablet y 1 en celular.
  - Avanza solo cada 4 segundos, en bucle.
  - Se frena con el cursor encima, al enfocarlo, cuando no está en pantalla o con el botón de pausa.
  - Se puede arrastrar con el dedo o el mouse, o mover con las flechas del teclado.
- **Movimiento reducido:** con la opción "reducir movimiento" del sistema activada, se apagan los desplazamientos, el avance automático y la reproducción automática de videos.

## Publicar en Vercel

1. Importá el repositorio en Vercel (**Add New → Project**). Detecta Vite solo: build `npm run build`, salida `dist`.
2. En **Settings → Environment Variables**, cargá `VITE_SITE_URL` con el dominio, sin barra final. Después hacé **Redeploy** para que se aplique.
3. `vercel.json` resuelve las rutas `/proyectos/...` al recargar y cachea los archivos con hash.

En el plan gratuito (Hobby), si el repositorio es privado, solo se publican los cambios del dueño de la cuenta de Vercel.