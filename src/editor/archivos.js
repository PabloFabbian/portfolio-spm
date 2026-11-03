/*
 * Fotos y videos que se eligen en el editor.
 * Las fotos se achican en el navegador antes de subirlas (JPG, lado mayor de 1600 px por defecto),
 * así quedan livianas sin que haya que prepararlas. Los videos se suben tal cual: a Cloudinary
 * (MP4, MOV o WEBM de hasta 100 MB) o, si no está configurado, a GitHub (MP4 o WEBM de hasta 4 MB).
 */
import { PESO_MAXIMO_DE_SUBIDA } from '../lib/contenido.js'
import { VIDEOS_EN_GITHUB, videosEnLaNube } from './contexto.js'

export function pesoLegible(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  const megas = bytes / 1024 / 1024
  return megas >= 10 ? `${Math.round(megas)} MB` : `${megas.toFixed(1).replace('.', ',')} MB`
}

/** 12,5 s · 1:05 */
export function segundosLegibles(n) {
  const total = Math.max(0, Math.round((Number(n) || 0) * 10) / 10)
  if (total < 60) return `${String(total).replace('.', ',')} s`
  const minutos = Math.floor(total / 60)
  return `${minutos}:${String(Math.floor(total - minutos * 60)).padStart(2, '0')}`
}

/** El identificador que GitHub le da a un archivo de texto (para saber si cambió) */
export async function shaDeTexto(texto) {
  const codificar = new TextEncoder()
  const datos = codificar.encode(texto.replace(/\r\n/g, '\n'))
  const cabecera = codificar.encode(`blob ${datos.length}\0`)
  const todo = new Uint8Array(cabecera.length + datos.length)
  todo.set(cabecera)
  todo.set(datos, cabecera.length)
  const hash = await crypto.subtle.digest('SHA-1', todo)
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function abrirImagen(archivo) {
  const url = URL.createObjectURL(archivo)
  const imagen = new Image()
  imagen.src = url
  try {
    await imagen.decode()
    return imagen
  } catch {
    throw new Error('No pude abrir la foto. Si es HEIC (la de los iPhone), exportala como JPG y probá de nuevo.')
  } finally {
    URL.revokeObjectURL(url)
  }
}

function dibujar(imagen, { ladoMaximo, recorte }) {
  const ancho = imagen.naturalWidth
  const alto = imagen.naturalHeight
  let origen = [0, 0, ancho, alto]
  let destino

  if (recorte) {
    // Recorta al centro para llenar exactamente el tamaño pedido
    const escala = Math.max(recorte.ancho / ancho, recorte.alto / alto)
    const anchoVisible = recorte.ancho / escala
    const altoVisible = recorte.alto / escala
    origen = [(ancho - anchoVisible) / 2, (alto - altoVisible) / 2, anchoVisible, altoVisible]
    destino = [recorte.ancho, recorte.alto]
  } else {
    const escala = Math.min(1, ladoMaximo / Math.max(ancho, alto))
    destino = [Math.round(ancho * escala), Math.round(alto * escala)]
  }

  const lienzo = document.createElement('canvas')
  ;[lienzo.width, lienzo.height] = destino
  const contexto = lienzo.getContext('2d')
  contexto.fillStyle = '#ece6da' // si la foto tiene partes transparentes, quedan color hueso
  contexto.fillRect(0, 0, lienzo.width, lienzo.height)
  contexto.imageSmoothingQuality = 'high'
  contexto.drawImage(imagen, ...origen, 0, 0, ...destino)
  return lienzo
}

const aJpg = (lienzo) =>
  new Promise((listo, fallo) =>
    lienzo.toBlob((blob) => (blob ? listo(blob) : fallo(new Error('No pude preparar la foto.'))), 'image/jpeg', 0.85),
  )

/** Duración y tamaño de un video, si el navegador puede leerlo (si no, null) */
export function leerVideo(url) {
  return new Promise((listo) => {
    const video = document.createElement('video')
    let temporizador
    const terminar = (datos) => {
      clearTimeout(temporizador)
      video.onloadedmetadata = null
      video.onerror = null
      video.removeAttribute('src')
      video.load()
      listo(datos)
    }
    temporizador = setTimeout(() => terminar(null), 10000)
    video.onloadedmetadata = () =>
      terminar({
        duracion: Number.isFinite(video.duration) ? video.duration : null,
        ancho: video.videoWidth || null,
        alto: video.videoHeight || null,
      })
    video.onerror = () => terminar(null)
    video.muted = true
    video.preload = 'metadata'
    video.src = url
  })
}

/**
 * Prepara un archivo elegido para subir.
 * acepta: 'imagen', 'video' o 'ambos'. videos: adónde van los videos (ver contexto.js).
 * Devuelve un archivo "nuevo" del editor:
 * { origen: 'nuevo', blob, ext, kind, url, peso, nombreOriginal, destino, duracion? }
 */
export async function prepararArchivo(archivo, { acepta = 'imagen', ladoMaximo = 1600, recorte = null, videos = VIDEOS_EN_GITHUB } = {}) {
  const nombre = archivo.name ?? ''
  const tipo = archivo.type ?? ''
  const esVideo = tipo.startsWith('video/') || /\.(mp4|m4v|webm|mov)$/i.test(nombre)
  const esImagen = !esVideo && (tipo.startsWith('image/') || /\.(jpe?g|png|webp|avif|gif|heic|heif)$/i.test(nombre))
  const nuevo = (blob, ext, kind) => ({
    origen: 'nuevo',
    blob,
    ext,
    kind,
    url: URL.createObjectURL(blob),
    peso: blob.size,
    nombreOriginal: nombre,
    destino: 'repo',
  })

  if (esVideo) {
    if (acepta === 'imagen') throw new Error('Acá va una foto, no un video.')
    const webm = /webm/i.test(tipo) || /\.webm$/i.test(nombre)
    const mp4 = /mp4/i.test(tipo) || /\.(mp4|m4v)$/i.test(nombre)

    if (videosEnLaNube(videos)) {
      // Cloudinary acepta casi cualquier video (también .mov) y lo convierte para la web
      if (archivo.size > videos.pesoMaximo) {
        throw new Error(
          `Este video pesa ${pesoLegible(archivo.size)} y el máximo es ${pesoLegible(videos.pesoMaximo)}. Exportalo más corto o en menor calidad (por ejemplo, 1080p).`,
        )
      }
      const video = nuevo(archivo, webm ? 'webm' : 'mp4', 'video')
      const datos = await leerVideo(video.url)
      return { ...video, destino: 'nube', duracion: datos?.duracion ?? null, sinVista: !datos }
    }

    const ext = webm ? 'webm' : mp4 ? 'mp4' : null
    if (!ext) throw new Error('Los videos .mov no se ven en todos los navegadores: exportalo como MP4 (H.264).')
    if (archivo.size > PESO_MAXIMO_DE_SUBIDA) {
      throw new Error(
        `Este video pesa ${pesoLegible(archivo.size)} y el máximo es 4 MB. Exportalo más corto o en 720p (por ejemplo con CapCut o HandBrake).`,
      )
    }
    const video = nuevo(archivo, ext, 'video')
    const datos = await leerVideo(video.url)
    return { ...video, duracion: datos?.duracion ?? null }
  }

  if (!esImagen) throw new Error('Ese archivo no es una foto ni un video.')
  if (acepta === 'video') throw new Error('Acá va un video (MP4).')

  if (/gif/i.test(tipo) || /\.gif$/i.test(nombre)) {
    if (archivo.size > PESO_MAXIMO_DE_SUBIDA) throw new Error(`Este GIF pesa ${pesoLegible(archivo.size)} y el máximo es 4 MB.`)
    return nuevo(archivo, 'gif', 'image')
  }

  const imagen = await abrirImagen(archivo)
  const yaEsLiviana =
    !recorte &&
    /jpe?g/i.test(tipo) &&
    archivo.size <= 600 * 1024 &&
    Math.max(imagen.naturalWidth, imagen.naturalHeight) <= ladoMaximo
  const blob = yaEsLiviana ? archivo : await aJpg(dibujar(imagen, { ladoMaximo, recorte }))
  if (blob.size > PESO_MAXIMO_DE_SUBIDA) throw new Error('La foto quedó demasiado pesada. Probá con otra.')
  return nuevo(blob, 'jpg', 'image')
}
