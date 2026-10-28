/*
 * La clave y el "pase".
 * - La clave se compara en tiempo constante y cada error demora la respuesta.
 * - Cinco errores desde la misma conexión la bloquean 15 minutos, y 30 errores en total
 *   (desde cualquier lado) pausan el editor 15 minutos.
 * - Con la clave correcta se entrega un pase firmado que vale 15 minutos: alcanza para
 *   subir los archivos y publicar sin mandar la clave en cada pedido.
 * La firma depende de la clave y del permiso de GitHub: si se cambia cualquiera de los dos,
 * los pases anteriores dejan de valer.
 */
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const DURACION_DEL_PASE = 15 * 60 * 1000
const VENTANA = 15 * 60 * 1000
const MAX_ERRORES_POR_CONEXION = 5
const MAX_ERRORES_EN_TOTAL = 30

// Errores recientes. Viven en la memoria de cada servidor de Vercel: frenan los intentos
// seguidos, y la clave larga (12 caracteres o más) hace inútil probar al azar.
const errores = new Map()
let erroresEnTotal = []

function limpiarErrores(ahora) {
  for (const [ip, momentos] of errores) {
    const vigentes = momentos.filter((t) => ahora - t < VENTANA)
    if (vigentes.length) errores.set(ip, vigentes)
    else errores.delete(ip)
  }
  erroresEnTotal = erroresEnTotal.filter((t) => ahora - t < VENTANA)
}

/**
 * Si no se puede probar la clave todavía: { minutos, general } (general = la pausa es para todos).
 * Si se puede, null.
 */
export function bloqueo(ip, ahora = Date.now()) {
  limpiarErrores(ahora)
  const propios = errores.get(ip) ?? []
  const minutosDesde = (momento) => Math.max(1, Math.ceil((momento + VENTANA - ahora) / 60000))
  if (propios.length >= MAX_ERRORES_POR_CONEXION) return { minutos: minutosDesde(propios[0]), general: false }
  if (erroresEnTotal.length >= MAX_ERRORES_EN_TOTAL) return { minutos: minutosDesde(erroresEnTotal[0]), general: true }
  return null
}

export function anotarError(ip, ahora = Date.now()) {
  errores.set(ip, [...(errores.get(ip) ?? []), ahora])
  erroresEnTotal.push(ahora)
}

export function olvidarErrores(ip) {
  errores.delete(ip)
}

const resumen = (texto) => createHash('sha256').update(texto, 'utf8').digest()

export function claveCorrecta(config, intento) {
  return timingSafeEqual(resumen(String(intento ?? '').trim()), resumen(config.clave))
}

const llave = (config) => createHmac('sha256', config.token).update(`pase-del-editor:${config.clave}`).digest()

export function crearPase(config, ahora = Date.now()) {
  const vence = ahora + DURACION_DEL_PASE
  const datos = Buffer.from(JSON.stringify({ vence, n: randomBytes(12).toString('base64url') })).toString('base64url')
  const firma = createHmac('sha256', llave(config)).update(datos).digest('base64url')
  return { pase: `${datos}.${firma}`, vence }
}

export function paseValido(config, req, ahora = Date.now()) {
  const encabezado = String(req.headers.authorization ?? '')
  const pase = encabezado.startsWith('Bearer ') ? encabezado.slice(7).trim() : ''
  const [datos, firma, sobra] = pase.split('.')
  if (!datos || !firma || sobra !== undefined) return false

  const esperada = createHmac('sha256', llave(config)).update(datos).digest()
  const recibida = Buffer.from(firma, 'base64url')
  if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) return false

  try {
    const { vence } = JSON.parse(Buffer.from(datos, 'base64url').toString('utf8'))
    return typeof vence === 'number' && vence > ahora
  } catch {
    return false
  }
}

export const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms))
