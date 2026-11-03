/*
 * Cloudinary: firmas para que el navegador suba los videos directo a la cuenta (sin pasar
 * por Vercel, que no acepta más de 4,5 MB), y el pedido para preparar un clip de antemano.
 * El API Secret nunca sale del servidor: el navegador recibe solo la firma de esa subida.
 */
import { createHash } from 'node:crypto'
import { CARPETA_EN_LA_NUBE, ETIQUETA_EN_LA_NUBE, transformacionesAnticipadas } from '../../src/lib/nube.js'

export class ErrorDeCloudinary extends Error {
  constructor(mensaje, status = 0) {
    super(mensaje)
    this.status = status
  }
}

/**
 * Firma de Cloudinary: los parámetros ordenados por nombre ("a=1&b=2"), seguidos del
 * API Secret, en SHA-1 (o SHA-256). No se firman file, cloud_name, resource_type ni api_key.
 */
export function firmar(parametros, secreto, algoritmo = 'sha1') {
  const texto = Object.keys(parametros)
    .filter((clave) => parametros[clave] !== undefined && parametros[clave] !== null && parametros[clave] !== '')
    .sort()
    .map((clave) => `${clave}=${parametros[clave]}`)
    .join('&')
  return createHash(algoritmo).update(`${texto}${secreto}`, 'utf8').digest('hex')
}

const ahora = () => Math.floor(Date.now() / 1000)

/**
 * Lo que necesita el navegador para subir un video: la dirección y los campos firmados.
 * Al subirlo, Cloudinary ya prepara el clip y su cuadro fijo (eager), en segundo plano:
 * así no hay que esperar la primera vez que alguien abre la web.
 */
export function firmarSubida(cloudinary, { uso, inicio }) {
  const parametros = {
    asset_folder: CARPETA_EN_LA_NUBE,
    eager: transformacionesAnticipadas(uso, inicio),
    eager_async: 'true',
    tags: ETIQUETA_EN_LA_NUBE,
    timestamp: String(ahora()),
  }
  return {
    subida: `${cloudinary.api}/v1_1/${cloudinary.cuenta}/video/upload`,
    campos: { ...parametros, api_key: cloudinary.apiKey, signature: firmar(parametros, cloudinary.secreto, cloudinary.algoritmo) },
  }
}

/** Pide que se prepare el clip de un video que ya está en Cloudinary (si cambió desde dónde arranca) */
export async function prepararClip(cloudinary, { id, uso, inicio }) {
  const parametros = {
    eager: transformacionesAnticipadas(uso, inicio),
    eager_async: 'true',
    public_id: id,
    timestamp: String(ahora()),
    type: 'upload',
  }
  const cuerpo = new URLSearchParams({
    ...parametros,
    api_key: cloudinary.apiKey,
    signature: firmar(parametros, cloudinary.secreto, cloudinary.algoritmo),
  })

  let respuesta
  try {
    respuesta = await fetch(`${cloudinary.api}/v1_1/${cloudinary.cuenta}/video/explicit`, {
      method: 'POST',
      body: cuerpo,
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new ErrorDeCloudinary('No hubo respuesta de Cloudinary.')
  }
  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) throw new ErrorDeCloudinary(datos?.error?.message ?? `Cloudinary respondió con un error (${respuesta.status}).`, respuesta.status)
  return datos
}
