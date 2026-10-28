// POST /api/subir (con el pase; el cuerpo es el archivo) → { sha } del archivo guardado en GitHub
import { paseValido } from './_lib/auth.js'
import { leerConfig } from './_lib/config.js'
import { crearGitHub, explicarErrorDeGitHub } from './_lib/github.js'
import { CuerpoMuyGrande, aceptar, fallar, leerCrudo, responder } from './_lib/http.js'
import { PESO_MAXIMO_DE_SUBIDA } from '../src/lib/contenido.js'

/** Qué es el archivo según sus primeros bytes (no según el nombre, que se puede cambiar) */
function formatoDe(datos) {
  if (datos.length < 12) return null
  if (datos[0] === 0xff && datos[1] === 0xd8 && datos[2] === 0xff) return 'jpg'
  if (datos.toString('latin1', 1, 4) === 'PNG' && datos[0] === 0x89) return 'png'
  if (datos.toString('latin1', 0, 4) === 'RIFF' && datos.toString('latin1', 8, 12) === 'WEBP') return 'webp'
  if (datos.toString('latin1', 0, 4) === 'GIF8') return 'gif'
  if (datos[0] === 0x1a && datos[1] === 0x45 && datos[2] === 0xdf && datos[3] === 0xa3) return 'webm'
  if (datos.toString('latin1', 4, 8) === 'ftyp') {
    const marca = datos.toString('latin1', 8, 12)
    if (marca === 'avif' || marca === 'avis') return 'avif'
    if (marca === 'qt  ') return 'mov'
    return 'mp4'
  }
  return null
}

export default async function handler(req, res) {
  if (!aceptar(req, res, 'POST', 'application/octet-stream')) return

  const config = leerConfig()
  if (!config.listo) return fallar(res, 503, 'sin-configurar', 'El editor todavía no está configurado en Vercel.')
  if (!paseValido(config, req)) {
    return fallar(res, 401, 'pase', 'Hace falta la clave, o pasó demasiado tiempo desde que la pusiste. Tocá Publicar de nuevo.')
  }

  let datos
  try {
    datos = await leerCrudo(req, PESO_MAXIMO_DE_SUBIDA)
  } catch (error) {
    if (error instanceof CuerpoMuyGrande) return fallar(res, 413, 'muy-grande', 'El archivo pesa más de 4 MB.')
    return fallar(res, 400, 'pedido', 'El archivo llegó mal. Probá de nuevo.')
  }
  if (!datos.length) return fallar(res, 400, 'vacio', 'El archivo llegó vacío.')

  const formato = formatoDe(datos)
  if (formato === 'mov') {
    return fallar(res, 415, 'formato', 'Los videos .mov no se ven en todos los navegadores: exportalo como MP4 (H.264).')
  }
  if (!formato) return fallar(res, 415, 'formato', 'Ese archivo no es una foto ni un video que la web pueda mostrar.')

  try {
    const sha = await crearGitHub(config).crearBlob(datos)
    responder(res, 200, { ok: true, sha, formato, peso: datos.length })
  } catch (error) {
    const { status, codigo, mensaje } = explicarErrorDeGitHub(error)
    fallar(res, status, codigo, mensaje)
  }
}
