// Pedidos del editor al servidor (api/)

export class ErrorDelEditor extends Error {
  constructor(mensaje, { codigo = null, errores = [], status = 0 } = {}) {
    super(mensaje)
    this.codigo = codigo
    this.errores = errores
    this.status = status
  }
}

async function pedir(url, opciones = {}) {
  let respuesta
  try {
    respuesta = await fetch(url, opciones)
  } catch {
    throw new ErrorDelEditor('No hay conexión con el servidor. Revisá internet y probá de nuevo.', { codigo: 'conexion' })
  }

  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    // Respuesta que no es JSON (por ejemplo, Vercel cortando un archivo demasiado grande)
  }

  if (!respuesta.ok || !datos?.ok) {
    const mensaje =
      datos?.mensaje ??
      (respuesta.status === 413
        ? 'El archivo es demasiado pesado (el máximo es 4 MB).'
        : respuesta.status === 404 || (respuesta.ok && datos === null)
          ? 'No encuentro el servidor del editor. En Vercel tiene que estar la carpeta api/ del proyecto; en la compu, abrí la web con npm run dev.'
          : `El servidor respondió con un error (${respuesta.status}). Probá de nuevo en un rato.`)
    throw new ErrorDelEditor(mensaje, { codigo: datos?.codigo, errores: datos?.errores ?? [], status: respuesta.status })
  }
  return datos
}

const json = (cuerpo, pase) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...(pase ? { Authorization: `Bearer ${pase}` } : {}) },
  body: JSON.stringify(cuerpo),
})

export const consultarEstado = () => pedir('/api/estado', { cache: 'no-store' })

export const entrar = (clave) => pedir('/api/entrar', json({ clave }))

export const subir = (pase, blob) =>
  pedir('/api/subir', {
    method: 'POST',
    headers: { Authorization: `Bearer ${pase}`, 'Content-Type': 'application/octet-stream' },
    body: blob,
  })

export const publicar = (pase, cuerpo) => pedir('/api/publicar', json(cuerpo, pase))

/**
 * Commit que está publicado ahora en la web (lo deja el build en /version.json).
 * Devuelve null si no se sabe (por ejemplo, en la compu con npm run dev).
 */
export async function commitEnLaWeb() {
  try {
    const respuesta = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!respuesta.ok) return null
    const datos = await respuesta.json()
    return typeof datos?.commit === 'string' ? datos.commit : null
  } catch {
    return null
  }
}
