// GET /api/estado → si el editor está listo para publicar (sin mostrar ningún dato secreto)
import { leerConfig } from './_lib/config.js'
import { aceptar, responder } from './_lib/http.js'

export default function handler(req, res) {
  if (!aceptar(req, res, 'GET')) return
  const { listo, problemas } = leerConfig()
  responder(res, 200, { ok: true, listo, problemas })
}
