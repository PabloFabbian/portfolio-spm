/*
 * Respuestas y lectura de pedidos. Funciona igual en Vercel y en `npm run dev`
 * (ver vite.plugins.js), así que no usa los atajos res.status() ni res.json().
 */

export function responder(res, status, datos) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(datos))
}

export function fallar(res, status, codigo, mensaje, extra = {}) {
  responder(res, status, { ok: false, codigo, mensaje, ...extra })
}

/**
 * Corta el pedido si no usa el método (y el tipo de contenido) esperado.
 * Exigir application/json evita que otra página mande pedidos desde el navegador de alguien
 * con un formulario común.
 */
export function aceptar(req, res, metodo, tipo) {
  if (req.method !== metodo) {
    res.setHeader('Allow', metodo)
    fallar(res, 405, 'metodo', `Este pedido tiene que ser ${metodo}.`)
    return false
  }
  if (tipo && !String(req.headers['content-type'] ?? '').toLowerCase().startsWith(tipo)) {
    fallar(res, 415, 'tipo', 'El pedido llegó en un formato que no corresponde.')
    return false
  }
  return true
}

export class CuerpoMuyGrande extends Error {}

/** Cuerpo del pedido como Buffer (Vercel ya lo entrega leído cuando es application/octet-stream) */
export async function leerCrudo(req, maximo) {
  if (Buffer.isBuffer(req.body) || req.body instanceof Uint8Array) {
    const datos = Buffer.from(req.body)
    if (datos.length > maximo) throw new CuerpoMuyGrande()
    return datos
  }
  const partes = []
  let total = 0
  for await (const parte of req) {
    total += parte.length
    if (total > maximo) throw new CuerpoMuyGrande()
    partes.push(parte)
  }
  return Buffer.concat(partes)
}

/** Cuerpo del pedido como JSON (Vercel ya lo entrega leído cuando es application/json) */
export async function leerJson(req) {
  const cuerpo = req.body
  if (cuerpo && typeof cuerpo === 'object' && !Buffer.isBuffer(cuerpo) && !(cuerpo instanceof Uint8Array)) return cuerpo
  if (typeof cuerpo === 'string') return JSON.parse(cuerpo)
  const crudo = await leerCrudo(req, 2 * 1024 * 1024)
  return crudo.length ? JSON.parse(crudo.toString('utf8')) : {}
}

/** IP de quien pide (Vercel la pone en x-real-ip y x-forwarded-for) */
export function ipDe(req) {
  const real = String(req.headers['x-real-ip'] ?? '').trim()
  if (real) return real
  const reenviada = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()
  return reenviada || req.socket?.remoteAddress || 'desconocida'
}

export const objeto = (valor) => (valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {})
