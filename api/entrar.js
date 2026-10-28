// POST /api/entrar { clave } → { pase, vence } si la clave es correcta
import { anotarError, bloqueo, claveCorrecta, crearPase, esperar, olvidarErrores } from './_lib/auth.js'
import { leerConfig } from './_lib/config.js'
import { aceptar, fallar, ipDe, leerJson, responder } from './_lib/http.js'

export default async function handler(req, res) {
  if (!aceptar(req, res, 'POST', 'application/json')) return

  const config = leerConfig()
  if (!config.listo) {
    return fallar(res, 503, 'sin-configurar', 'El editor todavía no está configurado en Vercel.', { problemas: config.problemas })
  }

  const ip = ipDe(req)
  const pausa = bloqueo(ip)
  if (pausa) {
    const espera = `${pausa.minutos} minuto${pausa.minutos === 1 ? '' : 's'}`
    return fallar(
      res,
      429,
      'demasiados-intentos',
      pausa.general
        ? `Hubo muchos intentos con claves equivocadas en los últimos minutos (no necesariamente tuyos) y el editor se pausó por seguridad. Esperá ${espera} y probá de nuevo.`
        : `Hubo demasiados intentos con la clave equivocada. Esperá ${espera} y probá de nuevo.`,
    )
  }

  let cuerpo
  try {
    cuerpo = await leerJson(req)
  } catch {
    return fallar(res, 400, 'pedido', 'El pedido llegó mal. Probá de nuevo.')
  }

  if (!claveCorrecta(config, cuerpo?.clave)) {
    anotarError(ip)
    console.warn(`[editor] clave incorrecta desde ${ip}`)
    await esperar(900)
    return fallar(res, 401, 'clave', 'La clave no es correcta.')
  }

  olvidarErrores(ip)
  responder(res, 200, { ok: true, ...crearPase(config) })
}
