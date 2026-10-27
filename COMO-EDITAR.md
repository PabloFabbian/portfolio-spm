# Cómo editar tu web

Todo lo que se ve en la web (textos, fotos y videos) está en la carpeta **`contenido`**. Lo podés cambiar desde la página de GitHub, sin instalar nada. Cada cambio que guardás se publica solo en uno o dos minutos.

> Esta guía es para cuando el repositorio esté en tu cuenta de GitHub y conectado a tu cuenta de Vercel.

**Dónde está cada cosa:**

| Qué | Dónde |
| --- | --- |
| Textos de la portada, Sobre mí y Contacto | `contenido/sitio.js` |
| Textos de cada proyecto | `contenido/proyectos.js` |
| Fotos de la portada y de Sobre mí | `contenido/fotos/` |
| Fotos y videos de cada proyecto | `contenido/proyectos/<nombre-del-proyecto>/` |

---

## Antes de empezar: 4 reglas

1. **Cambiá solo lo que está entre comillas** `'así'`.
2. **No borres** las comillas `' '`, las comas del final ni los signos `[ ]` y `{ }`.
3. **Escribí cada texto en una sola línea**, sin apretar Enter adentro de las comillas. Aunque quede largo, está bien.
4. **Si un texto lleva apóstrofo**, usá `’` en lugar de `'`, porque `'` corta el texto. Las comillas dobles `" "` sí se pueden usar.

Si te equivocás, la web no se rompe: sigue mostrando la última versión que funcionaba (ver [Si algo sale mal](#si-algo-sale-mal)).

---

## Cambiar un texto

1. Entrá a tu repositorio en **github.com** y abrí la carpeta `contenido`.
2. Abrí `sitio.js` (portada, sobre mí, contacto) o `proyectos.js` (proyectos).
3. Tocá el **lápiz** (*Edit this file*), arriba a la derecha del archivo.
4. Buscá el texto con **Ctrl + F** (o **Cmd + F** en Mac) y cambialo **dentro de las comillas**.
5. Tocá **Commit changes…**, escribí qué cambiaste (por ejemplo: "Cambio la frase de la portada") y confirmá con **Commit changes**.
6. Esperá uno o dos minutos y recargá la web.

**Ejemplo:** para cambiar la frase de la portada, en `sitio.js`:

```js
frase: 'Lo más personal es lo más creativo.',
```

pasa a:

```js
frase: 'Tu nueva frase.',
```

Cada texto tiene arriba una línea que empieza con `//` explicando dónde aparece en la web. Esas líneas no se ven en la web.

---

## Cambiar o agregar fotos y videos

Las fotos y videos **se toman solos por el nombre del archivo**: no hace falta escribir nada en el código.

1. Renombrá el archivo en tu compu **con el nombre exacto** de las tablas de abajo, en minúsculas (por ejemplo `afiche.jpg`).
2. En GitHub, entrá a la carpeta donde va (por ejemplo `contenido/proyectos/el-club-debede`).
3. Tocá **Add file → Upload files**, arrastrá el archivo y tocá **Commit changes**.
4. Si ya había un archivo **con el mismo nombre y la misma extensión**, se reemplaza solo.
5. Si el anterior tenía **otra extensión** (por ejemplo, el viejo es `portada-1.webp` y el nuevo `portada-1.jpg`), borrá el viejo: abrilo, tocá los tres puntos **…** y elegí **Delete file**.

Mientras falte un archivo, en la web aparece un aviso del estilo **[Falta afiche.jpg]** que dice qué subir y con qué nombre.

> GitHub acepta archivos de hasta 25 MB desde la página. Igual, para que la web cargue rápido, conviene que las fotos pesen menos de 400 KB y los videos menos de 6 MB.

---

## Mapa de la web: qué se cambia dónde

### Portada

| Lo que ves | Archivo | Qué cambiar |
| --- | --- | --- |
| Nombre gigante | `contenido/sitio.js` | `nombreEnRenglones` (un renglón por línea) |
| Nombre de arriba a la izquierda y del pie | `contenido/sitio.js` | `nombre` |
| Recuadro negro "Productor audiovisual" | `contenido/sitio.js` | `profesion` |
| Frase | `contenido/sitio.js` | `frase` |
| Foto fija | `contenido/fotos/` | archivo `portada-1` |
| Foto que aparece y desaparece | `contenido/fotos/` | archivo `portada-2` |
| Cinta negra con palabras rojas | `contenido/sitio.js` | `cinta` |
| "Portfolio 2026" y el año del © | `contenido/sitio.js` | `anio` |

### Sobre mí

| Lo que ves | Archivo | Qué cambiar |
| --- | --- | --- |
| Retrato | `contenido/fotos/` | archivo `sobre-mi` |
| Título "Detrás de cada proyecto" | `contenido/sitio.js` | `sobreMi` → `titulo` |
| Párrafos | `contenido/sitio.js` | `sobreMi` → `parrafos` (un texto por párrafo) |
| Tabla (Rol principal, Formación, Ubicación, Idiomas) | `contenido/sitio.js` | `sobreMi` → `datos` (cada renglón tiene `dato` y `valor`) |

### Trabajos (lista de la home)

| Lo que ves | Archivo | Qué cambiar |
| --- | --- | --- |
| Orden de los proyectos | `contenido/proyectos.js` | el orden de los bloques (ver [Agregar, sacar u ordenar proyectos](#agregar-sacar-u-ordenar-proyectos)) |
| Título de cada proyecto | `contenido/proyectos.js` | `titulo` |
| Línea chica debajo del título | `contenido/proyectos.js` | `lineaEnLaLista` |
| Imagen de la tarjeta | `contenido/proyectos/<proyecto>/` | archivo `tarjeta` |
| Colores de la tarjeta si no hay imagen | `contenido/proyectos.js` | `colores` (`'negro'`, `'hueso'` o `'rojo'`) |

### Contacto

| Lo que ves | Archivo | Qué cambiar |
| --- | --- | --- |
| Email | `contenido/sitio.js` | `contacto` → `email` |
| Instagram | `contenido/sitio.js` | `contacto` → `instagram` (sin @) |
| WhatsApp que se lee | `contenido/sitio.js` | `contacto` → `whatsappVisible` |
| WhatsApp al que lleva el botón | `contenido/sitio.js` | `contacto` → `whatsappNumero` (todo junto: 54 + 9 + área + número) |
| Mensaje que aparece escrito al abrir WhatsApp | `contenido/sitio.js` | `contacto` → `whatsappMensaje` |

### Página de cada proyecto

Todos los textos están en `contenido/proyectos.js`, dentro del bloque de ese proyecto. Las fotos y videos, en su carpeta `contenido/proyectos/<proyecto>/`.

| Lo que ves (de arriba hacia abajo) | Qué cambiar |
| --- | --- |
| Recuadro negro con el punto rojo | `etiqueta` |
| Texto de arriba a la derecha | `categoria` y `anio` |
| Título gigante | `tituloEnRenglones` |
| Texto al lado del título | `bajada` |
| Video grande | archivo `video-principal` (o `imagen-principal` si no hay video) |
| Texto chico abajo a la derecha del video | `formatoDeCamara` (opcional) |
| Los cuatro recuadros (Rol, Tareas…) | `ficha` (cada uno tiene `dato` y `valor`) |
| Afiche | archivo `afiche` |
| Frase grande de "Sobre el proyecto" | `frase` |
| Párrafos de "Sobre el proyecto" | `texto` (un texto por párrafo) |
| Cinta negra | `cinta` (opcional) |
| "Lo que hice" | `queHice` → `intro` y `tareas` (opcional) |
| Título del carrusel | `galeria` → `titulo` |
| Piezas del carrusel | archivos `galeria-1`, `galeria-2`… y sus títulos en `galeria` → `piezas` |
| Créditos | `creditos` (cada uno tiene `rol` y `nombre`) |

**Cómo se arma el carrusel:** la primera pieza de `piezas` usa el archivo `galeria-1`, la segunda `galeria-2`, y así. Cada pieza puede ser una foto o un video: se detecta solo por el archivo. En `comoSeHizo` va el texto que aparece al pasar el cursor por una foto (en el celular, al tocarla). Si subís más archivos que piezas escritas (por ejemplo, `galeria-5`), se agregan solos al carrusel.

### Lo que se ve al compartir el link (WhatsApp, Instagram, LinkedIn)

La imagen es `public/imagen-para-compartir.jpg` (1200 × 630). Para cambiarla, subí otra con el mismo nombre a la carpeta `public`.

---

## Nombres y medidas de los archivos

### Fotos generales · `contenido/fotos/`

| Archivo | Dónde aparece | Formato recomendado |
| --- | --- | --- |
| `portada-1` | Foto fija de la portada | Cuadrada, 1200 × 1200, con la cara al centro |
| `portada-2` | Foto que aparece y desaparece sobre `portada-1` | Igual que `portada-1` |
| `sobre-mi` | Retrato de Sobre mí | Vertical 4:5 (1080 × 1350), con la cara al centro |

### Fotos y videos de cada proyecto · `contenido/proyectos/<proyecto>/`

| Archivo | Dónde aparece | Formato recomendado |
| --- | --- | --- |
| `tarjeta.jpg` | Tarjeta del proyecto en la lista de trabajos | Vertical 4:5 (1080 × 1350) |
| `video-principal.mp4` | Video grande de arriba, en loop y sin sonido | Horizontal 16:9 (1920 × 1080), 10 a 15 s, menos de 6 MB |
| `imagen-principal.jpg` | En lugar del video principal, si no hay video | Horizontal 16:9 (1920 × 1080) |
| `afiche.jpg` | Afiche, al lado de "Sobre el proyecto" | Vertical 4:5 (1080 × 1350) |
| `galeria-1`, `galeria-2`… | Piezas del carrusel, en ese orden | Vertical 4:5 (1080 × 1350). Fotos `.jpg`; videos `.mp4` de 10 a 15 s, menos de 4 MB |

- **Fotos:** sirven `.jpg`, `.jpeg`, `.png` y `.webp`.
- **Videos:** `.mp4` (exportado en H.264, el formato más común) o `.webm`. Los videos se ven sin sonido, así que no hace falta audio.
- **Si falta la tarjeta**, se usa el afiche. Si falta el video principal, mientras tanto se ve tu foto de portada atenuada.
- **Recortes:** el video principal se ve vertical en el celular y muy apaisado en la computadora, y la portada cambia de proporción según la pantalla. Dejá lo importante en el centro.

---

## Agregar, sacar u ordenar proyectos

Todo se hace en `contenido/proyectos.js`. Cada proyecto es un bloque que empieza con `{` y termina con `},` y tiene arriba un título del estilo `// ============ EL CLUB DEBEDE ============`.

**Agregar un proyecto**

1. Copiá un bloque entero, desde el `{` hasta su `},`, y pegalo donde quieras que aparezca.
2. Cambiale los textos. En `carpeta` poné un nombre corto **sin espacios, tildes ni mayúsculas**, con guiones (por ejemplo `'nuevo-videoclip'`). Va a ser el final de la dirección web: `/proyectos/nuevo-videoclip`.
3. Creá la carpeta de fotos: en `contenido/proyectos/`, tocá **Add file → Upload files** y arrastrá **una carpeta** de tu compu llamada igual que `carpeta` (`nuevo-videoclip`), con las fotos adentro.

**Sacar un proyecto:** borrá su bloque entero, desde el `{` hasta su `},`. Si querés, borrá también su carpeta de fotos.

**Cambiar el orden:** cortá un bloque entero y pegalo en otro lugar. "Proyecto 2 de 5" y "Siguiente proyecto" se actualizan solos.

**Secciones opcionales:** si un proyecto no necesita la cinta negra (`cinta`), "Lo que hice" (`queHice`) o el texto del video (`formatoDeCamara`), borrá esa parte y la sección desaparece.

---

## Si algo sale mal

- Después de cada cambio, en la página principal del repositorio aparece al lado del último cambio un **punto amarillo** (publicando), una **tilde verde** (publicado) o una **cruz roja** (no se pudo publicar).
- **Con la cruz roja la web sigue funcionando**, con la versión anterior. Casi siempre es una comilla o una coma que se borró: volvé a abrir el archivo, revisá alrededor de lo que cambiaste y guardá de nuevo.
- Para volver atrás: abrí el archivo, tocá **History**, buscá cómo estaba antes y copiá ese texto.
- Si no lo encontrás, pedile ayuda a Pablo (PF Software) y pasale el link del cambio.

---

## Lo que falta completar hoy

Todo lo que está entre [corchetes] en la web:

- **El Club Debede:** bandas y bares de los créditos, fotos y videos.
- **Rodajes y producciones:** años, otros rodajes de la facultad y el rol en cada uno.
- **Gonna Go:** qué es, qué hacías y la línea de presentación.
- **Televisión Barata:** año, qué hacías en cada emisión y el equipo.
- **Shows y festivales:** fechas y otros festivales además de Lollapalooza Argentina.
- **Video principal:** confirmar o borrar el texto "4K · 25 FPS" (`formatoDeCamara`).
- **Todos los proyectos:** tarjeta, afiche, video principal y fotos del carrusel.

---

*Para quien programe la web: la parte técnica está en `README.md`.*