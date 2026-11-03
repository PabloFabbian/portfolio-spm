/*
 * POST /api/preparar-video (con el pase) { id, uso, inicio }
 * Le pide a Cloudinary que prepare el clip de un video que ya estaba subido, cuando se
 * cambió desde qué segundo arranca. Sin esto, los videos de más de 40 MB no se verían
 * (Cloudinary no los recorta en el momento).
 */
import { paseValido } from './_lib/auth.js'
import { ErrorDeCloudinary, prepararClip } from './_lib/cloudinary.js'
import { leerCloudinary, leerConfig } from './_lib/config.js'
import { aceptar, fallar, leerJson, objeto, responder } from './_lib/http.js'
import { esIdDeCloudinary } from '../src/lib/contenido.js'
import { LADO } from '../src/lib/nube.js'

export default async function handler(req, res) {
  if (!aceptar(req, res, 'POST', 'application/json')) return

  const config = leerConfig()
  if (!config.listo) return fallar(res, 503, 'sin-configurar', 'El editor todavía no está configurado en Vercel.')
  if (!paseValido(config, req)) {
    return fallar(res, 401, 'pase', 'Hace falta la clave, o pasó demasiado tiempo desde que la pusiste. Tocá Publicar de nuevo.')
  }
  const cloudinary = leerCloudinary()
  if (!cloudinary.activo) return fallar(res, 503, 'sin-cloudinary', 'Cloudinary no está configurado en Vercel.')

  let cuerpo
  try {
    cuerpo = objeto(await leerJson(req))
  } catch {
    return fallar(res, 400, 'pedido', 'El pedido llegó mal. Probá de nuevo.')
  }
  const id = String(cuerpo.id ?? '')
  const uso = String(cuerpo.uso ?? '')
  const inicio = Number(cuerpo.inicio ?? 0)
  if (!esIdDeCloudinary(id) || !Object.hasOwn(LADO, uso) || !Number.isFinite(inicio) || inicio < 0 || inicio > 36000) {
    return fallar(res, 400, 'pedido', 'El pedido llegó mal. Probá de nuevo.')
  }

  try {
    await prepararClip(cloudinary, { id, uso, inicio })
    responder(res, 200, { ok: true })
  } catch (error) {
    const mensaje = error instanceof ErrorDeCloudinary ? error.message : 'Algo falló al hablar con Cloudinary.'
    console.warn(`[editor] no se pudo preparar ${id}: ${mensaje}`)
    fallar(res, 502, 'cloudinary', mensaje)
  }
}
