# Portfolio · Santiago Pérez Mejías

Sitio web de Santiago Pérez Mejías, productor audiovisual: una home (portada, sobre mí, trabajos y contacto), una página por proyecto y un editor de contenido en `/editar`.

**Para cambiar textos, fotos o videos no hace falta saber programar:** se usa el editor, explicado en **[COMO-EDITAR.md](COMO-EDITAR.md)**.

**Stack:** React 19 · Vite 8 · Tailwind CSS 4 · framer-motion · React Router 8 · Vercel Functions (Node) para el editor · Cloudinary para los videos. JavaScript (JSX).

## Para arrancar

Necesitás **Node 22.22 o superior** (lo pide React Router 8).

```bash
npm install
npm run dev       # servidor local en http://localhost:5173 (incluye /api para probar el editor)
npm run build     # compila a /dist
npm run preview   # sirve lo compilado para revisarlo (sin /api)
npm run lint      # revisa el código con ESLint
```

## Estructura

```
portfolio-spm/
├── COMO-EDITAR.md          ← guía para editar el contenido (para Santi)
├── contenido/              ← TODO el contenido editable
│   ├── sitio.json          ← textos de portada, sobre mí y contacto
│   ├── proyectos.json      ← textos de cada proyecto (el orden es el de la web)
│   ├── fotos/              ← portada-1, portada-2, sobre-mi
│   └── proyectos/<carpeta>/← tarjeta, video-principal, imagen-principal, afiche, galeria-N
├── api/                    ← servidor del editor (Vercel Functions)
│   ├── estado.js · entrar.js · subir.js · publicar.js
│   ├── firmar-video.js · preparar-video.js   ← videos en Cloudinary
│   └── _lib/               ← configuración, clave y pase, GitHub, Cloudinary, respuestas
├── public/
│   ├── imagen-para-compartir.jpg   ← vista previa al compartir el link (1200×630)
│   └── favicon-16/32, apple-touch-icon, icon-192/512, site.webmanifest
├── src/
│   ├── data/               ← traduce `contenido/` al formato que usan los componentes
│   │   ├── site.js · projects.js
│   │   ├── media.js        ← detecta fotos y videos por nombre de archivo
│   │   └── vista-previa.js ← muestra el borrador del editor en la vista previa
│   ├── lib/contenido.js    ← forma y límites del contenido (lo usan el editor y api/publicar)
│   ├── lib/nube.js         ← direcciones de los videos de Cloudinary (las mismas en web, editor y api)
│   ├── editor/             ← el panel /editar: formularios, fotos, encuadre, vista previa, publicar
│   ├── components/         ← encabezado, carrusel, video, cinta, trama de puntos, transición…
│   ├── sections/home/      ← Hero, About, Works, Contact
│   ├── sections/project/   ← portada, visor, ficha, afiche, tareas, créditos, siguiente
│   ├── pages/              ← Home, Project, Editor y NotFound (404)
│   ├── hooks/              ← scroll entre páginas, título de la pestaña y recarga al publicar
│   ├── lib/tokens.js       ← colores y curva de animación para estilos dinámicos
│   ├── index.css           ← paleta, tipografías y utilidades (config de Tailwind v4)
│   └── App.jsx · main.jsx
├── vite.config.js · vite.plugins.js (api local y /version.json) · eslint.config.js
├── index.html · vercel.json · .env
```

## Cómo funciona el contenido

- **Textos:** `contenido/sitio.json` y `contenido/proyectos.json` usan nombres en castellano (`frase`, `bajada`, `ficha`, `galeria`…). `src/data/site.js` y `src/data/projects.js` los traducen a lo que usan los componentes y completan valores por defecto si falta algún campo. Lo que está entre [corchetes] es un dato pendiente.
- **Fotos y videos:** se detectan con `import.meta.glob` según el nombre del archivo, sin importar mayúsculas ni extensión (`src/data/media.js`). Si hay dos archivos con el mismo nombre, gana `.jpg/.jpeg/.png` sobre `.webp`. Vite los procesa y les agrega un hash al compilar.
- **Avisos de lo que falta:** mientras falte un archivo, la web muestra un aviso del estilo **[Falta afiche.jpg]** con el nombre exacto.
- **Galería:** la pieza 1 de `galeria.piezas` usa `galeria-1`, la 2 `galeria-2`… Si hay archivos de más, se agregan solos. Foto o video se decide por la extensión.
- **Encuadre e inicio:** cada foto o video puede tener `encuadre` (`"30% 70%"`, el `object-position` del recorte) y los videos, `inicio` (desde qué segundo arranca el clip de 15 s). Van en `medios` de `sitio.json` y de cada proyecto (`medios.tarjeta`, `medios["video-principal"]`…) y en cada pieza del carrusel.
- **Videos en Cloudinary:** un video subido desde el editor queda anotado como `nube: { cuenta, id, version, ancho, alto, duracion }` y tiene prioridad sobre un archivo con el mismo nombre. `src/lib/nube.js` arma la dirección: desde `inicio`, 15 segundos, sin sonido, `c_limit` a 1600 px (video principal) o 1280 px (carrusel), `q_auto` y MP4/H.264 escrito (`f_mp4,vc_h264`), más un cuadro fijo `.jpg` para el `poster`. El formato va explícito para que la cuenta no le sume ajustes automáticos y la dirección coincida exactamente con lo que se preparó.
- **Reproducción:** `src/components/Video.jsx` no descarga nada hasta que el video se ve (`preload="none"` con póster) y reproduce solo lo que está en pantalla: el carrusel dibuja cada pieza 3 veces y solo corre la copia visible. Los videos del repo (sin recortar) arrancan en `inicio` desde el navegador.

## Editor de contenido (`/editar`)

### Cómo funciona

1. `/editar` carga el panel (se descarga aparte, así que no suma peso a la web). Arranca con el contenido y las fotos de la versión publicada.
2. Todo se edita en el navegador. Las fotos se achican ahí mismo (JPG, lado mayor de 1600 px, o 2400 para la imagen principal). La **vista previa** abre la web real en un recuadro con `?vista-previa`, y `src/data/vista-previa.js` toma el borrador de la ventana del editor.
3. Al **publicar**:
   - `POST /api/entrar` controla la clave y devuelve un pase firmado que vale una hora (alcanza para subir videos pesados).
   - **Videos, con Cloudinary configurado:** por cada video nuevo, `POST /api/firmar-video` devuelve una firma de un solo uso y el navegador lo sube **directo a Cloudinary** (en partes de 20 MB si es grande), sin pasar por Vercel. La subida ya le pide a Cloudinary que prepare el clip y su cuadro (`eager` en segundo plano). Si cambió el `inicio` de un video ya subido, `POST /api/preparar-video` pide el clip nuevo (`explicit`).
   - `POST /api/subir` crea en GitHub un blob por cada foto nueva (y por cada video, si no hay Cloudinary).
   - `POST /api/publicar` valida el contenido con `src/lib/contenido.js` y guarda todo en un solo commit: los dos JSON, las fotos y los videos del repo, los renombres del carrusel y lo que se borra. El commit se llama `Editor web: …` y lleva la lista de cambios.
4. Vercel ve el commit y despliega. El build deja `/version.json` con el commit publicado, y el editor lo consulta para avisar cuándo el cambio ya está en la web. En ese momento avisa por `BroadcastChannel` a las pestañas abiertas de la web, que se recargan solas (`src/hooks/useRecargarAlPublicar.js`).

### Seguridad

- **Credenciales:** la clave (`ADMIN_PASSWORD`), el permiso de GitHub (`GITHUB_TOKEN`) y el secreto de Cloudinary (`CLOUDINARY_API_SECRET`) viven solo en las variables de entorno de Vercel. Nunca llegan al navegador ni al repositorio: para subir un video, el navegador recibe solo la firma de esa subida, que vale una hora y no sirve para cambiar sus parámetros.
- **La clave:**
  - Tiene que tener 12 caracteres o más; si no, el editor no publica.
  - Se compara en tiempo constante y cada error demora la respuesta.
  - 5 errores desde la misma IP la bloquean 15 minutos, y 30 errores en total pausan el editor 15 minutos.
  - El pase firmado depende de la clave y del token: si se cambia cualquiera de los dos, los pases anteriores dejan de valer.
- **Lo que el servidor deja escribir:**
  - Solo `contenido/sitio.json`, `contenido/proyectos.json`, las fotos y videos con los nombres fijos dentro de `contenido/fotos/` y `contenido/proyectos/<carpeta>/`, y `public/imagen-para-compartir.jpg`. El editor no puede tocar código.
  - Los archivos se revisan por sus primeros bytes (JPG, PNG, WEBP, GIF, AVIF, MP4, WEBM) y pueden pesar hasta 4 MB.
- **Conflictos:** si los JSON cambiaron en GitHub desde que se abrió el editor, la publicación se frena (409) en vez de pisar el cambio.
- **Otros cuidados:**
  - `/editar` lleva `noindex`, y ninguna página de la web se puede mostrar dentro de otro sitio (`frame-ancestors 'self'`).
  - Los pedidos exigen `application/json` o `application/octet-stream`, así que otra página no puede mandarlos con un formulario.
- **Límites conocidos:**
  - El freno de intentos vive en la memoria de cada instancia de Vercel. Si hay varias instancias, o se reinician, el contador vuelve a cero. Por eso la clave larga es lo que más protege.
  - Vercel no acepta pedidos de más de 4,5 MB: sin Cloudinary, los videos pueden pesar hasta 4 MB.
  - **Cloudinary gratis:** hasta 100 MB por video y 25 créditos por mes (1 crédito = 1 GB guardado, 1 GB entregado o 1000 transformaciones). No pide tarjeta ni cobra: si se pasa del límite, avisa. Cloudinary no recorta en el momento videos de más de 40 MB (en el plan gratis): por eso los clips se piden de antemano (`eager`/`explicit`) y las direcciones de `src/lib/nube.js` tienen que coincidir exactamente con lo que se pide.
  - Los videos reemplazados o borrados no se borran de Cloudinary (quedan en la carpeta `portfolio-web`, etiquetados `portfolio-web`), así una versión vieja del repo sigue funcionando.

### Configurarlo (una sola vez)

1. **Crear el permiso de GitHub.** En GitHub: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
   - **Repository access:** *Only select repositories* → este repositorio.
   - **Permissions → Repository permissions → Contents:** *Read and write*. Metadata queda en *Read*, que es obligatorio.
   - **Expiration:** la más larga que permita. Cuando venza, el editor avisa que el permiso no es válido.
   - Crealo con **la misma cuenta de GitHub que está conectada a Vercel**. En el plan Hobby, con un repositorio privado, Vercel solo despliega los commits del dueño de la cuenta.
2. **Cargar las variables en Vercel.** En **Settings → Environment Variables**, para *Production* y marcadas como *Sensitive*:
   - `GITHUB_TOKEN`: el token del paso 1.
   - `ADMIN_PASSWORD`: la clave para publicar, de 12 caracteres o más. Una frase de 3 o 4 palabras es fácil de recordar y difícil de adivinar.
   - Opcional: `GITHUB_REPO` (`usuario/repositorio`) y `GITHUB_BRANCH` (por defecto, la rama del deploy). Hacen falta solo si en Vercel está apagado *Automatically expose System Environment Variables*.
3. **Videos en Cloudinary** (opcional; sin esto, los videos van a GitHub y pueden pesar hasta 4 MB). Con la cuenta gratuita de Cloudinary, cargá también en Vercel, igual que las anteriores:
   - `CLOUDINARY_CLOUD_NAME`: el **Cloud name** (en Cloudinary: **Home / Dashboard**, arriba, en *Product Environment*).
   - `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`: en **Settings → API Keys** (o el botón *Go to API Keys*). Para ver el secreto hay que tocarlo, y puede pedir un código que llega por mail.
   - En lugar de las tres sirve `CLOUDINARY_URL` (`cloudinary://API_KEY:API_SECRET@CLOUD_NAME`). Opcionales: `CLOUDINARY_MAX_MB` (por defecto 100) y `CLOUDINARY_SIGNATURE_ALGORITHM=sha256` si la cuenta firma con SHA-256. `CLOUDINARY_API_URL` es solo para pruebas.
4. **Redeploy** (Deployments → ⋯ → Redeploy) para que se apliquen.
5. **Probar:** abrí `/editar`. Si no aparece ningún aviso arriba, está listo. Con Cloudinary, la ayuda de los videos dice «MP4 o MOV de hasta 100 MB».

**Cambiar la clave:** se edita `ADMIN_PASSWORD` en Vercel y se hace Redeploy.

**Al pasarle el proyecto a Santi:** después de transferir el repo, hay que crear un token nuevo desde su cuenta y cargar las variables en su proyecto de Vercel. La cuenta de Cloudinary ya es suya: se cargan las mismas tres variables de Cloudinary y los videos siguen donde están.

### Probarlo en la compu

`npm run dev` también atiende `/api/*`, con los mismos archivos que usa Vercel (`vite.plugins.js`). Creá un `.env.local` (no se sube al repo) con:

```bash
GITHUB_TOKEN=github_pat_...
ADMIN_PASSWORD=una clave larga de prueba
GITHUB_REPO=usuario/portfolio-spm
GITHUB_BRANCH=prueba-editor   # recomendado: una rama de prueba, así no se publica en la web real
CLOUDINARY_CLOUD_NAME=...     # opcional: videos en Cloudinary
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Ojo: publicar desde la compu escribe de verdad en GitHub, en la rama indicada, y sube de verdad los videos a Cloudinary.

## Diseño

- **Paleta** (`src/index.css`, bloque `@theme`): negro `#0B0B0B`, hueso `#ECE6DA` y rojo `#C4301F`. Si cambiás un color ahí, cambia en todo el sitio (el editor incluido).
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
  - Muestra 3 a la vez en escritorio, 2 en tablet y 1 en celular. Solo se reproduce el video que está a la vista.
  - Avanza solo cada 4 segundos, en bucle.
  - Se frena con el cursor encima, al enfocarlo, cuando no está en pantalla o con el botón de pausa.
  - Se puede arrastrar con el dedo o el mouse, o mover con las flechas del teclado.
- **Movimiento reducido:** con la opción "reducir movimiento" del sistema activada, se apagan los desplazamientos, el avance automático y la reproducción automática de videos.

## Publicar en Vercel

1. Importá el repositorio en Vercel (**Add New → Project**). Detecta Vite solo: build `npm run build`, salida `dist`. La carpeta `api/` se publica sola como funciones.
2. En **Settings → Environment Variables**, cargá `VITE_SITE_URL` con el dominio, sin barra final, y las variables del editor (ver arriba). Después hacé **Redeploy** para que se apliquen.
3. `vercel.json`:
   - Resuelve las rutas de la web (`/proyectos/...`, `/editar`) al recargar, sin tocar `/api`.
   - Cachea los archivos con hash.
   - Marca `/editar` como `noindex` y le da 30 segundos a las funciones.
  - Solo deja mostrar la web dentro de un recuadro desde la misma web (la vista previa del editor): otra página no puede meterla en un iframe.

En el plan gratuito (Hobby), si el repositorio es privado, solo se publican los cambios del dueño de la cuenta de Vercel. Por eso el token del editor tiene que ser de esa misma cuenta.
