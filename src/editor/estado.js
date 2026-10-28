/*
 * Estado del editor: el contenido publicado convertido a algo editable, los cambios que hay,
 * y cómo se arma la publicación (qué fotos y videos subir, mover o borrar).
 *
 * Cada foto o video del editor es un "archivo":
 * - publicado: { origen: 'publicado', ruta, url, ext, kind } (ya está en el repo)
 * - nuevo:     { origen: 'nuevo', blob, url, ext, kind, peso } (elegido y sin publicar)
 */
import sitioPublicado from '../../contenido/sitio.json'
import proyectosPublicados from '../../contenido/proyectos.json'
import textoSitio from '../../contenido/sitio.json?raw'
import textoProyectos from '../../contenido/proyectos.json?raw'
import { slugify } from '../data/media.js'
import {
  ARCHIVOS_DE_FOTOS,
  ARCHIVOS_DE_PROYECTO,
  RUTA_COMPARTIR,
  RUTA_PROYECTOS,
  RUTA_SITIO,
  normalizarProyectos,
  normalizarSitio,
} from '../lib/contenido.js'
import { shaDeTexto } from './archivos.js'

const URLS = import.meta.glob(
  [
    '/contenido/fotos/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm,JPG,JPEG,PNG,WEBP,AVIF,GIF,MP4,WEBM}',
    '/contenido/proyectos/*/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm,JPG,JPEG,PNG,WEBP,AVIF,GIF,MP4,WEBM}',
  ],
  { eager: true, query: '?url', import: 'default' },
)

const PRIORIDAD = ['jpg', 'jpeg', 'png', 'avif', 'gif', 'webp', 'mp4', 'webm']
const VIDEOS = ['mp4', 'webm']
export const CARPETA_FOTOS = 'contenido/fotos'
export const carpetaDe = (proyecto) => `contenido/proyectos/${proyecto.carpeta}`

/** Rutas (sin la barra inicial) de las fotos y videos que ya están publicados */
export const RUTAS_PUBLICADAS = Object.keys(URLS).map((ruta) => ruta.slice(1))

export function partesDe(ruta) {
  const barra = ruta.lastIndexOf('/')
  const archivo = ruta.slice(barra + 1)
  const punto = archivo.lastIndexOf('.')
  return { carpeta: ruta.slice(0, barra), nombre: archivo.slice(0, punto).toLowerCase(), ext: archivo.slice(punto + 1).toLowerCase() }
}

function archivoPublicado(ruta) {
  const { ext } = partesDe(ruta)
  return { origen: 'publicado', ruta, url: URLS[`/${ruta}`], ext, kind: VIDEOS.includes(ext) ? 'video' : 'image' }
}

/** El archivo que usa la web para ese nombre (si hay varios con distinta extensión, gana el de mayor prioridad) */
function buscarPublicado(carpeta, nombre) {
  const candidatos = RUTAS_PUBLICADAS.filter((ruta) => {
    const partes = partesDe(ruta)
    return partes.carpeta === carpeta && partes.nombre === nombre
  }).sort((a, b) => PRIORIDAD.indexOf(partesDe(a).ext) - PRIORIDAD.indexOf(partesDe(b).ext))
  return candidatos.length ? archivoPublicado(candidatos[0]) : null
}

let contador = 0
export const nuevoId = () => `e${++contador}`
const conId = (fila) => ({ ...fila, _id: nuevoId() })

function sitioParaEditar(sitio) {
  return { ...sitio, sobreMi: { ...sitio.sobreMi, datos: sitio.sobreMi.datos.map(conId) } }
}

export function proyectoParaEditar(p) {
  const carpeta = carpetaDe(p)
  const galeriaPublicada = RUTAS_PUBLICADAS.map(partesDe).filter((x) => x.carpeta === carpeta && /^galeria-\d+$/.test(x.nombre))
  const ultimaPublicada = Math.max(0, ...galeriaPublicada.map((x) => Number(x.nombre.slice(8))))
  const cantidad = Math.max(p.galeria.piezas.length, ultimaPublicada)

  return {
    ...p,
    formatoDeCamara: p.formatoDeCamara ?? '',
    cinta: p.cinta ?? [],
    queHice: { intro: p.queHice?.intro ?? '', tareas: (p.queHice?.tareas ?? []).map(conId) },
    ficha: p.ficha.map(conId),
    creditos: p.creditos.map(conId),
    galeria: {
      titulo: p.galeria.titulo,
      piezas: Array.from({ length: cantidad }, (_, i) => {
        const pieza = p.galeria.piezas[i] ?? { tipo: 'foto', titulo: '' }
        const archivo = buscarPublicado(carpeta, `galeria-${i + 1}`)
        return {
          tipo: archivo ? (archivo.kind === 'video' ? 'video' : 'foto') : pieza.tipo,
          titulo: pieza.titulo ?? '',
          comoSeHizo: pieza.comoSeHizo ?? '',
          _id: nuevoId(),
          _archivo: archivo,
        }
      }),
    },
    _id: nuevoId(),
    _medios: Object.fromEntries(ARCHIVOS_DE_PROYECTO.map((nombre) => [nombre, buscarPublicado(carpeta, nombre)])),
  }
}

/** Proyecto vacío para "Agregar proyecto" */
export function proyectoNuevo(titulo, carpetasUsadas, autor) {
  const base = slugify(titulo) || 'proyecto'
  let carpeta = base
  for (let n = 2; carpetasUsadas.has(carpeta); n++) carpeta = `${base}-${n}`
  return proyectoParaEditar({
    carpeta,
    titulo,
    tituloEnRenglones: [titulo],
    etiqueta: '',
    categoria: '',
    anio: '',
    lineaEnLaLista: '',
    bajada: '',
    colores: { fondo: 'negro', puntos: 'rojo' },
    ficha: [],
    frase: '',
    texto: [],
    galeria: { titulo: 'Clips y fotos', piezas: [] },
    creditos: autor ? [{ rol: 'Producción', nombre: autor }] : [],
  })
}

export function crearEstadoInicial() {
  const sitio = normalizarSitio(sitioPublicado).datos
  const proyectos = normalizarProyectos(proyectosPublicados).datos
  return {
    sitio: sitioParaEditar(sitio),
    proyectos: proyectos.map(proyectoParaEditar),
    medios: {
      ...Object.fromEntries(ARCHIVOS_DE_FOTOS.map((nombre) => [nombre, buscarPublicado(CARPETA_FOTOS, nombre)])),
      compartir: { origen: 'publicado', ruta: RUTA_COMPARTIR, url: '/imagen-para-compartir.jpg', ext: 'jpg', kind: 'image' },
    },
  }
}

/** Versión de los archivos de contenido que se cargaron en el editor (para no pisar cambios de otro) */
export async function baseInicial() {
  return { [RUTA_SITIO]: await shaDeTexto(textoSitio), [RUTA_PROYECTOS]: await shaDeTexto(textoProyectos) }
}

/** El contenido tal como se guardaría: { sitio: {datos, errores}, proyectos: {datos, errores} } */
export function contenidoParaGuardar(estado) {
  return { sitio: normalizarSitio(estado.sitio), proyectos: normalizarProyectos(estado.proyectos) }
}

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const mismoArchivo = (a, b) => {
  if (a?.origen === 'nuevo' || b?.origen === 'nuevo') return a === b
  return (a?.ruta ?? null) === (b?.ruta ?? null)
}

/** Lista de cambios sin publicar, en palabras (también es el mensaje del commit) */
export function listarCambios(estado, inicial) {
  const ahora = contenidoParaGuardar(estado)
  const antes = contenidoParaGuardar(inicial)
  const s1 = ahora.sitio.datos
  const s0 = antes.sitio.datos
  const cambios = []

  const portada = (s) => [s.nombre, s.nombreEnRenglones, s.profesion, s.frase, s.cinta, s.anio]
  if (
    !igual(portada(s1), portada(s0)) ||
    !mismoArchivo(estado.medios['portada-1'], inicial.medios['portada-1']) ||
    !mismoArchivo(estado.medios['portada-2'], inicial.medios['portada-2'])
  ) {
    cambios.push('Portada')
  }
  if (!igual(s1.sobreMi, s0.sobreMi) || !mismoArchivo(estado.medios['sobre-mi'], inicial.medios['sobre-mi'])) {
    cambios.push('Sobre mí')
  }
  if (!igual(s1.contacto, s0.contacto)) cambios.push('Contacto')
  if (!mismoArchivo(estado.medios.compartir, inicial.medios.compartir)) cambios.push('Imagen para compartir')

  const previos = new Map(inicial.proyectos.map((p, i) => [p._id, { p, datos: antes.proyectos.datos[i] }]))
  const actuales = new Set(estado.proyectos.map((p) => p._id))

  const ordenAntes = inicial.proyectos.map((p) => p._id).filter((id) => actuales.has(id))
  const ordenAhora = estado.proyectos.map((p) => p._id).filter((id) => previos.has(id))
  if (!igual(ordenAntes, ordenAhora)) cambios.push('Orden de los proyectos')

  estado.proyectos.forEach((p, i) => {
    const datos = ahora.proyectos.datos[i]
    const nombre = datos.titulo || 'Proyecto sin título'
    const previo = previos.get(p._id)
    if (!previo) {
      cambios.push(`Proyecto nuevo: ${nombre}`)
      return
    }
    const partes = []
    const sinGaleria = (datosDelProyecto) => ({ ...datosDelProyecto, galeria: null })
    if (!igual(sinGaleria(datos), sinGaleria(previo.datos))) partes.push('textos')
    const NOMBRES = { tarjeta: 'tarjeta', 'video-principal': 'video principal', 'imagen-principal': 'imagen principal', afiche: 'afiche' }
    for (const [clave, texto] of Object.entries(NOMBRES)) {
      if (!mismoArchivo(p._medios[clave], previo.p._medios[clave])) partes.push(texto)
    }
    const piezas = p.galeria.piezas
    const piezasAntes = previo.p.galeria.piezas
    const galeriaCambio =
      !igual(datos.galeria, previo.datos.galeria) ||
      piezas.length !== piezasAntes.length ||
      piezas.some((pieza, j) => !mismoArchivo(pieza._archivo, piezasAntes[j]?._archivo))
    if (galeriaCambio) partes.push('carrusel')
    if (partes.length) cambios.push(`${nombre}: ${partes.join(', ')}`)
  })

  for (const { p, datos } of previos.values()) {
    if (!actuales.has(p._id)) cambios.push(`Se borra: ${datos.titulo || p.carpeta}`)
  }
  return cambios
}

/**
 * Arma lo que hay que mandar al publicar.
 * publicados: rutas de fotos y videos que hay ahora en el repo.
 * Devuelve { sitio, proyectos, errores, operaciones, subidas: [{ archivo, destino }] }.
 */
export function armarPublicacion(estado, inicial, publicados) {
  const { sitio, proyectos } = contenidoParaGuardar(estado)
  const operaciones = []
  const subidas = []
  const enCarpeta = (carpeta) => publicados.filter((ruta) => partesDe(ruta).carpeta === carpeta)

  // Archivos de nombre fijo (portada-1, tarjeta, afiche...)
  function fijo(carpeta, nombre, archivo) {
    let destino = null
    if (archivo?.origen === 'publicado') destino = archivo.ruta
    if (archivo?.origen === 'nuevo') {
      destino = `${carpeta}/${nombre}.${archivo.ext}`
      subidas.push({ archivo, destino })
    }
    for (const ruta of enCarpeta(carpeta)) {
      if (partesDe(ruta).nombre === nombre && ruta !== destino) operaciones.push({ borrar: ruta })
    }
  }

  for (const nombre of ARCHIVOS_DE_FOTOS) fijo(CARPETA_FOTOS, nombre, estado.medios[nombre])
  if (estado.medios.compartir?.origen === 'nuevo') subidas.push({ archivo: estado.medios.compartir, destino: RUTA_COMPARTIR })

  for (const p of estado.proyectos) {
    const carpeta = carpetaDe(p)
    for (const nombre of ARCHIVOS_DE_PROYECTO) fijo(carpeta, nombre, p._medios[nombre])

    // Carrusel: la pieza 1 queda en galeria-1, la 2 en galeria-2... (si se reordenó, se renombran)
    const destinos = new Set()
    p.galeria.piezas.forEach((pieza, i) => {
      const archivo = pieza._archivo
      if (!archivo) return
      const destino = `${carpeta}/galeria-${i + 1}.${archivo.ext}`
      destinos.add(destino)
      if (archivo.origen === 'nuevo') subidas.push({ archivo, destino })
      else if (archivo.ruta !== destino) operaciones.push({ ruta: destino, desde: archivo.ruta })
    })
    for (const ruta of enCarpeta(carpeta)) {
      if (/^galeria-\d+$/.test(partesDe(ruta).nombre) && !destinos.has(ruta)) operaciones.push({ borrar: ruta })
    }
  }

  const carpetasActuales = new Set(estado.proyectos.map((p) => p.carpeta))
  for (const p of inicial.proyectos) {
    if (!carpetasActuales.has(p.carpeta)) operaciones.push({ borrarCarpeta: carpetaDe(p) })
  }

  return {
    sitio: sitio.datos,
    proyectos: proyectos.datos,
    errores: [...sitio.errores, ...proyectos.errores],
    operaciones,
    subidas,
  }
}

/** Rutas publicadas después de aplicar las operaciones */
export function rutasDespues(publicados, operaciones) {
  const rutas = new Set(publicados)
  for (const op of operaciones) {
    if (op.borrar) rutas.delete(op.borrar)
    if (op.borrarCarpeta) for (const ruta of [...rutas]) if (ruta.startsWith(`${op.borrarCarpeta}/`)) rutas.delete(ruta)
  }
  for (const op of operaciones) if (op.ruta && op.ruta !== RUTA_COMPARTIR) rutas.add(op.ruta)
  return [...rutas]
}

/** Después de publicar, cada archivo pasa a ser "publicado" en la ruta donde quedó */
export function estadoPublicado(estado) {
  const fijar = (archivo, ruta) =>
    archivo ? { origen: 'publicado', ruta, url: archivo.url, ext: archivo.ext, kind: archivo.kind } : null
  const enSuLugar = (archivo, carpeta, nombre) =>
    archivo?.origen === 'nuevo' ? fijar(archivo, `${carpeta}/${nombre}.${archivo.ext}`) : archivo

  return {
    ...estado,
    medios: {
      ...Object.fromEntries(ARCHIVOS_DE_FOTOS.map((n) => [n, enSuLugar(estado.medios[n], CARPETA_FOTOS, n)])),
      compartir: estado.medios.compartir?.origen === 'nuevo' ? fijar(estado.medios.compartir, RUTA_COMPARTIR) : estado.medios.compartir,
    },
    proyectos: estado.proyectos.map((p) => {
      const carpeta = carpetaDe(p)
      return {
        ...p,
        _medios: Object.fromEntries(ARCHIVOS_DE_PROYECTO.map((n) => [n, enSuLugar(p._medios[n], carpeta, n)])),
        galeria: {
          ...p.galeria,
          piezas: p.galeria.piezas.map((pieza, i) => ({
            ...pieza,
            _archivo: pieza._archivo ? fijar(pieza._archivo, `${carpeta}/galeria-${i + 1}.${pieza._archivo.ext}`) : null,
          })),
        },
      }
    }),
  }
}

/** Lo que necesita la web para mostrar el borrador en la vista previa (ver src/data/vista-previa.js) */
export function datosDeVistaPrevia(estado) {
  const { sitio, proyectos } = contenidoParaGuardar(estado)
  const archivos = {}
  const poner = (carpeta, nombre, archivo) => {
    if (archivo?.url) archivos[`/${carpeta}/${nombre}.${archivo.ext}`] = archivo.url
  }
  for (const nombre of ARCHIVOS_DE_FOTOS) poner(CARPETA_FOTOS, nombre, estado.medios[nombre])
  for (const p of estado.proyectos) {
    const carpeta = carpetaDe(p)
    for (const nombre of ARCHIVOS_DE_PROYECTO) poner(carpeta, nombre, p._medios[nombre])
    p.galeria.piezas.forEach((pieza, i) => poner(carpeta, `galeria-${i + 1}`, pieza._archivo))
  }
  return { sitio: sitio.datos, proyectos: proyectos.datos, archivos }
}
