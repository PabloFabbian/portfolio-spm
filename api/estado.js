// GET /api/estado → si el editor está listo para publicar y adónde van los videos (sin mostrar ningún dato secreto)
import { leerCloudinary, leerConfig } from './_lib/config.js'
import { aceptar, responder } from './_lib/http.js'
import { PESO_MAXIMO_DE_SUBIDA } from '../src/lib/contenido.js'

export default function handler(req, res) {
  if (!aceptar(req, res, 'GET')) return
  const { listo, problemas } = leerConfig()
  const cloudinary = leerCloudinary()
  const videos = cloudinary.activo
    ? { servicio: 'cloudinary', cuenta: cloudinary.cuenta, pesoMaximo: cloudinary.pesoMaximo }
    : { servicio: 'github', pesoMaximo: PESO_MAXIMO_DE_SUBIDA }
  responder(res, 200, { ok: true, listo, problemas, avisos: cloudinary.avisos, videos })
}
