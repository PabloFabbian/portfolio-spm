/*
 * Subida de videos directo del navegador a Cloudinary, con la firma que da /api/firmar-video.
 * Los videos de más de 20 MB se mandan en partes: si se corta internet, se reintenta solo
 * la parte que faltaba.
 */
import { ErrorDelEditor } from './api'

const PARTE = 20 * 1024 * 1024
const INTENTOS = 3

/** Mensaje claro para los errores más comunes de Cloudinary */
function explicar(status, mensaje = '') {
  if (/signature/i.test(mensaje)) {
    return 'Cloudinary no aceptó la firma: revisá en Vercel que CLOUDINARY_API_SECRET sea el «API Secret» de esta cuenta.'
  }
  if (/api[_ ]?key/i.test(mensaje)) return 'Cloudinary no reconoce la cuenta: revisá en Vercel CLOUDINARY_API_KEY.'
  if (/cloud[_ ]?name/i.test(mensaje)) return 'Cloudinary no encuentra la cuenta: revisá en Vercel CLOUDINARY_CLOUD_NAME.'
  if (/too large|file size/i.test(mensaje)) {
    return 'El video pesa más de lo que acepta la cuenta de Cloudinary (100 MB en la gratuita). Exportalo más corto o en menor calidad.'
  }
  if (/stale request/i.test(mensaje)) return 'La subida tardó demasiado y la firma venció. Tocá Publicar de nuevo: los videos que ya se subieron no se vuelven a subir.'
  if (status === 420 || /rate limit|limit exceeded|quota/i.test(mensaje)) {
    return 'La cuenta de Cloudinary llegó a su límite por ahora. Probá más tarde o revisá el uso en cloudinary.com.'
  }
  return mensaje ? `Cloudinary no aceptó el video: ${mensaje}` : `Cloudinary respondió con un error (${status}). Probá de nuevo en un rato.`
}

function enviar(url, campos, parte, nombre, cabeceras, alAvanzar) {
  return new Promise((listo, fallo) => {
    const formulario = new FormData()
    for (const [clave, valor] of Object.entries(campos)) formulario.append(clave, valor)
    formulario.append('file', parte, nombre)

    const pedido = new XMLHttpRequest()
    pedido.open('POST', url)
    for (const [clave, valor] of Object.entries(cabeceras)) pedido.setRequestHeader(clave, valor)
    pedido.upload.onprogress = (evento) => {
      if (evento.lengthComputable && evento.total) alAvanzar(Math.min(1, evento.loaded / evento.total) * parte.size)
    }
    pedido.onload = () => {
      let datos = null
      try {
        datos = JSON.parse(pedido.responseText)
      } catch {
        // respuesta que no es JSON
      }
      if (pedido.status >= 200 && pedido.status < 300 && datos && !datos.error) return listo(datos)
      fallo(new ErrorDelEditor(explicar(pedido.status, datos?.error?.message), { codigo: 'cloudinary', status: pedido.status }))
    }
    pedido.onerror = () =>
      fallo(new ErrorDelEditor('Se cortó la conexión mientras se subía el video. Revisá internet y probá de nuevo.', { codigo: 'conexion' }))
    pedido.send(formulario)
  })
}

const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms))

async function conReintentos(intento) {
  for (let vez = 1; ; vez++) {
    try {
      return await intento()
    } catch (error) {
      const vale = error.codigo === 'conexion' || error.status >= 500
      if (!vale || vez >= INTENTOS) throw error
      await esperar(2000 * vez)
    }
  }
}

/**
 * Sube un video. firma: { subida, campos } de /api/firmar-video. alAvanzar(fraccion) va de 0 a 1.
 * Devuelve la respuesta de Cloudinary (public_id, version, width, height, duration...).
 */
export async function subirALaNube(firma, archivo, alAvanzar = () => {}) {
  const total = archivo.size
  const nombre = archivo.name || 'video.mp4'
  if (total <= PARTE) {
    return conReintentos(() => enviar(firma.subida, firma.campos, archivo, nombre, {}, (enviados) => alAvanzar(enviados / total)))
  }

  const id = `${Date.now()}${String(Math.floor(Math.random() * 1e6)).padStart(6, '0')}`
  let respuesta = null
  for (let desde = 0; desde < total; desde += PARTE) {
    const hasta = Math.min(desde + PARTE, total)
    const cabeceras = { 'X-Unique-Upload-Id': id, 'Content-Range': `bytes ${desde}-${hasta - 1}/${total}` }
    respuesta = await conReintentos(() =>
      enviar(firma.subida, firma.campos, archivo.slice(desde, hasta), nombre, cabeceras, (enviados) => alAvanzar((desde + enviados) / total)),
    )
  }
  if (!respuesta?.public_id) throw new ErrorDelEditor('Cloudinary no terminó de recibir el video. Probá de nuevo.', { codigo: 'cloudinary' })
  return respuesta
}
