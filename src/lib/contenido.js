/*
 * Forma del contenido de la web: contenido/sitio.json y contenido/proyectos.json.
 * Lo usan el editor (/editar) y el servidor que publica (api/publicar.js): así los dos
 * guardan exactamente lo mismo, en el mismo orden y con los mismos límites.
 *
 * Este archivo no puede depender de Vite ni de React (también corre en el servidor).
 */
import { slugify } from '../data/media.js'

export const RUTA_SITIO = 'contenido/sitio.json'
export const RUTA_PROYECTOS = 'contenido/proyectos.json'
export const RUTA_COMPARTIR = 'public/imagen-para-compartir.jpg'

export const COLORES = ['negro', 'hueso', 'rojo']
export const TIPOS_DE_PIEZA = ['foto', 'video']

// Nombres fijos de las fotos y videos (la web los encuentra por nombre)
export const ARCHIVOS_DE_FOTOS = ['portada-1', 'portada-2', 'sobre-mi']
export const ARCHIVOS_DE_PROYECTO = ['tarjeta', 'video-principal', 'imagen-principal', 'afiche']
export const EXTENSIONES = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'mp4', 'webm']
export const MAX_GALERIA = 30
export const MAX_PROYECTOS = 30

// Peso máximo de cada foto o video que se sube desde el editor (Vercel corta los pedidos de más de 4,5 MB)
export const PESO_MAXIMO_DE_SUBIDA = 4 * 1024 * 1024

// Encuadre: qué punto de la foto o del video queda siempre a la vista cuando el recuadro la recorta
export const ENCUADRE_CENTRADO = '50% 50%'

// Segundos que dura cada clip de video en la web, desde su "inicio" (después vuelve a empezar)
export const DURACION_DEL_CLIP = 15

// Cómo se escriben la cuenta ("Cloud name") y el identificador de un video en Cloudinary
export const esCuentaDeCloudinary = (cuenta) => /^[a-z0-9][a-z0-9_-]{0,62}$/i.test(String(cuenta ?? ''))
export const esIdDeCloudinary = (id) => /^\w[\w/-]{0,250}$/.test(String(id ?? '')) && !String(id).includes('//')

/** Lee un encuadre "x% y%" (de 0 a 100). Devuelve null si no es válido. */
export function leerEncuadre(valor) {
  const partes = /^\s*(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%\s*$/.exec(String(valor ?? ''))
  if (!partes) return null
  const [x, y] = [partes[1], partes[2]].map((n) => Math.min(100, Math.max(0, Math.round(Number(n)))))
  return `${x}% ${y}%`
}

/** Texto final de un archivo de contenido (JSON con sangría de 2 espacios) */
export function serializar(datos) {
  return `${JSON.stringify(datos, null, 2)}\n`
}

const objeto = (valor) => (valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {})

function crearValidador() {
  const errores = []

  /** Texto de una línea: sin saltos ni caracteres de control, sin espacios en los bordes */
  function texto(valor, donde, { max = 300, requerido = false } = {}) {
    const limpio = (typeof valor === 'string' || typeof valor === 'number' ? String(valor) : '')
      .replace(/\p{Cc}+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (requerido && !limpio) errores.push(`${donde}: no puede quedar vacío.`)
    if (limpio.length > max) errores.push(`${donde}: es demasiado largo (máximo ${max} caracteres).`)
    return limpio
  }

  function lista(valor, donde, max, cadaUno) {
    const items = Array.isArray(valor) ? valor : []
    if (items.length > max) errores.push(`${donde}: hay demasiados (máximo ${max}).`)
    return items.slice(0, max).map((item, i) => cadaUno(item, `${donde} ${i + 1}`))
  }

  const textos = (valor, donde, max, largo) =>
    lista(valor, donde, max, (item, d) => texto(item, d, { max: largo })).filter(Boolean)

  const pares = (valor, donde, max, a, b, largoA, largoB) =>
    lista(valor, donde, max, (item, d) => {
      const fila = objeto(item)
      return { [a]: texto(fila[a], d, { max: largoA }), [b]: texto(fila[b], d, { max: largoB }) }
    }).filter((fila) => fila[a] || fila[b])

  /** Video guardado en Cloudinary: { cuenta, id, version, ancho?, alto?, duracion? } */
  function videoEnLaNube(entrada, donde) {
    const n = objeto(entrada)
    const cuenta = String(n.cuenta ?? '')
    const id = String(n.id ?? '')
    const version = Number(n.version)
    const valido = esCuentaDeCloudinary(cuenta) && esIdDeCloudinary(id) && Number.isInteger(version) && version > 0
    if (!valido) {
      errores.push(`${donde}: el video guardado en Cloudinary no es válido.`)
      return null
    }
    const salida = { cuenta, id, version }
    for (const clave of ['ancho', 'alto']) {
      const numero = Number(n[clave])
      if (Number.isInteger(numero) && numero > 0 && numero <= 20000) salida[clave] = numero
    }
    const duracion = Number(n.duracion)
    if (Number.isFinite(duracion) && duracion > 0 && duracion <= 36000) salida.duracion = Math.round(duracion * 100) / 100
    return salida
  }

  /**
   * Ajustes de una foto o un video, o null si no tiene ninguno:
   * - encuadre: el punto que queda siempre a la vista ("x% y%")
   * - inicio: en los videos, desde qué segundo arranca el clip de 15 segundos
   * - nube: en los videos guardados en Cloudinary, cuál es
   */
  function medio(entrada, donde, { video = false } = {}) {
    const m = objeto(entrada)
    const salida = {}
    const encuadre = leerEncuadre(m.encuadre)
    if (encuadre && encuadre !== ENCUADRE_CENTRADO) salida.encuadre = encuadre
    if (video) {
      const nube = m.nube == null ? null : videoEnLaNube(m.nube, donde)
      const tope = nube?.duracion ? Math.max(0, nube.duracion - 1) : 36000
      const inicio = Number(m.inicio)
      const redondeado = Number.isFinite(inicio) ? Math.round(Math.min(Math.max(inicio, 0), tope) * 10) / 10 : 0
      if (redondeado > 0) salida.inicio = redondeado
      if (nube) salida.nube = nube
    }
    return Object.keys(salida).length ? salida : null
  }

  /** Ajustes de cada foto o video fijo de una carpeta (portada-1, tarjeta, video-principal...) */
  function medios(entrada, donde, nombres, conVideo = []) {
    const m = objeto(entrada)
    const salida = {}
    for (const nombre of nombres) {
      const ajustes = medio(m[nombre], `${donde}, ${nombre}`, { video: conVideo.includes(nombre) })
      if (ajustes) salida[nombre] = ajustes
    }
    return salida
  }

  return { errores, texto, lista, textos, pares, medio, medios }
}

/**
 * Valida y ordena el contenido general.
 * Devuelve { datos, errores }: con errores no se publica, pero la vista previa igual funciona.
 */
export function normalizarSitio(entrada) {
  const v = crearValidador()
  const s = objeto(entrada)
  const sobreMi = objeto(s.sobreMi)
  const contacto = objeto(s.contacto)

  const anio = Number(String(s.anio ?? '').trim())
  const anioValido = Number.isInteger(anio) && anio >= 1990 && anio <= 2100
  if (!anioValido) v.errores.push('Portada, año: tiene que ser un número, por ejemplo 2026.')

  const datos = {
    nombre: v.texto(s.nombre, 'Portada, nombre completo', { max: 80, requerido: true }),
    nombreEnRenglones: v.textos(s.nombreEnRenglones, 'Portada, nombre gigante, renglón', 3, 40),
    profesion: v.texto(s.profesion, 'Portada, profesión', { max: 80 }),
    frase: v.texto(s.frase, 'Portada, frase', { max: 200 }),
    cinta: v.textos(s.cinta, 'Portada, cinta, palabra', 12, 60),
    anio: anioValido ? anio : 2026,
    sobreMi: {
      titulo: v.texto(sobreMi.titulo, 'Sobre mí, título', { max: 120 }),
      parrafos: v.textos(sobreMi.parrafos, 'Sobre mí, párrafo', 10, 1500),
      datos: v.pares(sobreMi.datos, 'Sobre mí, dato', 12, 'dato', 'valor', 60, 400),
    },
    contacto: {
      email: v.texto(contacto.email, 'Contacto, email', { max: 120 }),
      instagram: v.texto(contacto.instagram, 'Contacto, Instagram', { max: 60 }).replace(/^@+/, ''),
      whatsappVisible: v.texto(contacto.whatsappVisible, 'Contacto, WhatsApp como se lee', { max: 40 }),
      whatsappNumero: v.texto(contacto.whatsappNumero, 'Contacto, WhatsApp para el botón', { max: 30 }).replace(/\D/g, ''),
      whatsappMensaje: v.texto(contacto.whatsappMensaje, 'Contacto, mensaje de WhatsApp', { max: 300 }),
    },
  }

  const fotos = v.medios(s.medios, 'Fotos', ARCHIVOS_DE_FOTOS)
  if (Object.keys(fotos).length) datos.medios = fotos

  const { email, whatsappNumero } = datos.contacto
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) v.errores.push('Contacto, email: no parece un email.')
  if (whatsappNumero && (whatsappNumero.length < 10 || whatsappNumero.length > 15)) {
    v.errores.push('Contacto, WhatsApp para el botón: tiene que tener entre 10 y 15 números (54 + 9 + área + número).')
  }

  return { datos, errores: v.errores }
}

function normalizarProyecto(entrada, v, donde) {
  const p = objeto(entrada)
  const titulo = v.texto(p.titulo, `${donde}, título`, { max: 80, requerido: true })
  const d = (campo) => `${titulo || donde}, ${campo}`
  const colores = objeto(p.colores)
  const queHice = objeto(p.queHice)
  const galeria = objeto(p.galeria)
  const color = (valor, porDefecto) => (COLORES.includes(valor) ? valor : porDefecto)

  const carpeta = slugify(p.carpeta || titulo)
  if (!carpeta) v.errores.push(`${donde}: no tiene dirección (carpeta).`)

  const proyecto = {
    carpeta,
    titulo,
    tituloEnRenglones: v.textos(p.tituloEnRenglones, d('título gigante, renglón'), 3, 40),
    etiqueta: v.texto(p.etiqueta, d('etiqueta'), { max: 60 }),
    categoria: v.texto(p.categoria, d('categoría'), { max: 80 }),
    anio: v.texto(p.anio, d('año'), { max: 40 }),
    lineaEnLaLista: v.texto(p.lineaEnLaLista, d('línea en la lista'), { max: 160 }),
    bajada: v.texto(p.bajada, d('texto al lado del título'), { max: 400 }),
    colores: { fondo: color(colores.fondo, 'negro'), puntos: color(colores.puntos, 'rojo') },
  }

  const formato = v.texto(p.formatoDeCamara, d('texto sobre el video'), { max: 60 })
  if (formato) proyecto.formatoDeCamara = formato

  proyecto.ficha = v.pares(p.ficha, d('ficha'), 8, 'dato', 'valor', 40, 200)
  proyecto.frase = v.texto(p.frase, d('frase grande'), { max: 300 })
  proyecto.texto = v.textos(p.texto, d('párrafo'), 10, 1500)

  const cinta = v.textos(p.cinta, d('cinta, palabra'), 12, 60)
  if (cinta.length) proyecto.cinta = cinta

  const tareas = v
    .lista(queHice.tareas, d('tarea'), 8, (item, dd) => {
      const t = objeto(item)
      return {
        momento: v.texto(t.momento, dd, { max: 40 }),
        titulo: v.texto(t.titulo, dd, { max: 60 }),
        texto: v.texto(t.texto, dd, { max: 400 }),
      }
    })
    .filter((t) => t.titulo || t.texto)
  if (tareas.length) {
    const intro = v.texto(queHice.intro, d('intro de «Lo que hice»'), { max: 300 })
    proyecto.queHice = intro ? { intro, tareas } : { tareas }
  }

  // Las piezas no se filtran aunque estén vacías: la pieza 1 usa galeria-1, la 2 galeria-2...
  proyecto.galeria = {
    titulo: v.texto(galeria.titulo, d('título del carrusel'), { max: 80 }) || 'Clips y fotos',
    piezas: v.lista(galeria.piezas, d('pieza del carrusel'), MAX_GALERIA, (item, dd) => {
      const pieza = objeto(item)
      const salida = {
        tipo: TIPOS_DE_PIEZA.includes(pieza.tipo) ? pieza.tipo : 'foto',
        titulo: v.texto(pieza.titulo, dd, { max: 80 }),
      }
      const comoSeHizo = v.texto(pieza.comoSeHizo, dd, { max: 300 })
      if (comoSeHizo) salida.comoSeHizo = comoSeHizo
      Object.assign(salida, v.medio(pieza, dd, { video: salida.tipo === 'video' }))
      return salida
    }),
  }

  proyecto.creditos = v.pares(p.creditos, d('crédito'), 20, 'rol', 'nombre', 60, 120)

  const medios = v.medios(p.medios, d('fotos y videos'), ARCHIVOS_DE_PROYECTO, ['video-principal'])
  if (Object.keys(medios).length) proyecto.medios = medios
  return proyecto
}

/** Valida y ordena la lista de proyectos. Devuelve { datos, errores }. */
export function normalizarProyectos(entrada) {
  const v = crearValidador()
  const datos = v.lista(entrada, 'Proyecto', MAX_PROYECTOS, (p, donde) => normalizarProyecto(p, v, donde))

  const vistas = new Set()
  for (const p of datos) {
    if (p.carpeta && vistas.has(p.carpeta)) {
      v.errores.push(`Hay dos proyectos con la misma dirección (/proyectos/${p.carpeta}).`)
    }
    vistas.add(p.carpeta)
  }
  return { datos, errores: v.errores }
}

const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*'
const RUTA_DE_ARCHIVO = new RegExp(`^contenido/(?:(fotos)|proyectos/(${SLUG}))/([^/]+)\\.([A-Za-z0-9]+)$`)
const RUTA_DE_CARPETA = new RegExp(`^contenido/proyectos/(${SLUG})$`)

/**
 * Interpreta la ruta de una foto o video del contenido.
 * Solo acepta los nombres fijos (portada-1, tarjeta, galeria-3...) y las extensiones de fotos y videos.
 * Con estricta, además exige minúsculas (para los archivos que escribe el editor).
 * Devuelve { proyecto (o null si es de contenido/fotos), nombre, ext } o null.
 */
export function analizarRuta(ruta, { estricta = false } = {}) {
  const partes = RUTA_DE_ARCHIVO.exec(String(ruta ?? ''))
  if (!partes) return null
  const [, esFotos, proyecto, nombreOriginal, extOriginal] = partes
  const nombre = nombreOriginal.toLowerCase()
  const ext = extOriginal.toLowerCase()
  if (estricta && (nombre !== nombreOriginal || ext !== extOriginal)) return null
  if (!EXTENSIONES.includes(ext)) return null

  const valido = esFotos
    ? ARCHIVOS_DE_FOTOS.includes(nombre)
    : ARCHIVOS_DE_PROYECTO.includes(nombre) || /^galeria-[1-9]\d?$/.test(nombre)
  return valido ? { proyecto: proyecto ?? null, nombre, ext } : null
}

/** Devuelve la carpeta (slug) si la ruta es contenido/proyectos/<carpeta>, o null */
export function carpetaDeProyecto(ruta) {
  return RUTA_DE_CARPETA.exec(String(ruta ?? ''))?.[1] ?? null
}
