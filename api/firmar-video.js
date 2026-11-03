/*
 * POST /api/firmar-video (con el pase) { uso: 'principal' | 'galeria', inicio }
 * → { subida, campos, pesoMaximo }: la dirección de Cloudinary y los campos firmados para
 * que el navegador suba un video directo a la cuenta (ver api/_lib/cloudinary.js).
 */
import { paseValido } from './_lib/auth.js'
import { firmarSubida } from './_lib/cloudinary.js'
import { leerCloudinary, leerConfig } from './_lib/config.js'
import { aceptar, fallar, leerJson, objeto, responder } from './_lib/http.js'
import { LADO } from '../src/lib/nube.js'

export default async function handler(req, res) {
  if (!aceptar(req, res, 'POST', 'application/json')) return

  const config = leerConfig()
  if (!config.listo) return fallar(res, 503, 'sin-configurar', 'El editor todavía no está configurado en Vercel.')
  if (!paseValido(config, req)) {
    return fallar(res, 401, 'pase', 'Hace falta la clave, o pasó demasiado tiempo desde que la pusiste. Tocá Publicar de nuevo.')
  }
  const cloudinary = leerCloudinary()
  if (!cloudinary.activo) {
    return fallar(res, 503, 'sin-cloudinary', 'Cloudinary no está configurado en Vercel, así que los videos tienen que pesar hasta 4 MB.')
  }

  let cuerpo
  try {
    cuerpo = objeto(await leerJson(req))
  } catch {
    return fallar(res, 400, 'pedido', 'El pedido llegó mal. Probá de nuevo.')
  }
  const uso = String(cuerpo.uso ?? '')
  const inicio = Number(cuerpo.inicio ?? 0)
  if (!Object.hasOwn(LADO, uso) || !Number.isFinite(inicio) || inicio < 0 || inicio > 36000) {
    return fallar(res, 400, 'pedido', 'El pedido llegó mal. Probá de nuevo.')
  }

  responder(res, 200, { ok: true, cuenta: cloudinary.cuenta, pesoMaximo: cloudinary.pesoMaximo, ...firmarSubida(cloudinary, { uso, inicio }) })
}
