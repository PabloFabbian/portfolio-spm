/*
 * POST /api/publicar (con el pase)
 * { sitio, proyectos, archivos: [operaciones], base: { ruta: sha }, resumen }
 *
 * Guarda todo en un solo commit en la rama que publica Vercel:
 * - contenido/sitio.json y contenido/proyectos.json, validados y ordenados acá;
 * - las fotos y videos, solo con los nombres fijos y dentro de contenido/ (o la imagen
 *   para compartir): el editor no puede tocar el código de la web.
 * Si alguien cambió el contenido en GitHub desde que se abrió el editor, no pisa nada
 * y avisa (409).
 */
import { paseValido } from './_lib/auth.js'
import { leerConfig } from './_lib/config.js'
import { ErrorDeGitHub, crearGitHub, explicarErrorDeGitHub, shaDeBlob } from './_lib/github.js'
import { aceptar, fallar, leerJson, objeto, responder } from './_lib/http.js'
import {
  RUTA_COMPARTIR,
  RUTA_PROYECTOS,
  RUTA_SITIO,
  analizarRuta,
  carpetaDeProyecto,
  normalizarProyectos,
  normalizarSitio,
  serializar,
} from '../src/lib/contenido.js'

const SHA = /^[0-9a-f]{40}$/
const MAX_OPERACIONES = 300

class Conflicto extends Error {}

/** Revisa cada operación de archivos y la pasa a una forma segura */
function validarOperaciones(lista, carpetas) {
  if (lista == null) return []
  if (!Array.isArray(lista) || lista.length > MAX_OPERACIONES) throw new Error('La lista de archivos no es válida.')

  return lista.map((item) => {
    const op = objeto(item)

    if (typeof op.borrarCarpeta === 'string') {
      const carpeta = carpetaDeProyecto(op.borrarCarpeta)
      if (!carpeta || carpetas.has(carpeta)) throw new Error(`No se puede borrar la carpeta ${op.borrarCarpeta}.`)
      return { tipo: 'borrarCarpeta', ruta: op.borrarCarpeta }
    }

    if (typeof op.borrar === 'string') {
      if (!analizarRuta(op.borrar)) throw new Error(`No se puede borrar ${op.borrar}.`)
      return { tipo: 'borrar', ruta: op.borrar }
    }

    const ruta = String(op.ruta ?? '')
    const esCompartir = ruta === RUTA_COMPARTIR
    const destino = analizarRuta(ruta, { estricta: true })
    if (!esCompartir && (!destino || (destino.proyecto && !carpetas.has(destino.proyecto)))) {
      throw new Error(`No se puede guardar un archivo en ${ruta || '(sin ruta)'}.`)
    }
    if (typeof op.sha === 'string' && SHA.test(op.sha)) return { tipo: 'poner', ruta, sha: op.sha }
    if (typeof op.desde === 'string' && !esCompartir && analizarRuta(op.desde)) {
      return { tipo: 'copiar', ruta, desde: op.desde }
    }
    throw new Error(`Falta el archivo para ${ruta}.`)
  })
}

/** Arma las entradas del árbol nuevo a partir de lo que hay ahora en el repositorio */
function armarEntradas(operaciones, enRepo, textos) {
  const borrar = new Set()
  const poner = new Map()

  for (const op of operaciones) {
    if (op.tipo === 'borrarCarpeta') {
      for (const ruta of enRepo.keys()) if (ruta.startsWith(`${op.ruta}/`)) borrar.add(ruta)
    } else if (op.tipo === 'borrar') {
      if (enRepo.has(op.ruta)) borrar.add(op.ruta)
    } else if (op.tipo === 'poner') {
      poner.set(op.ruta, op.sha)
    } else if (op.tipo === 'copiar') {
      const sha = enRepo.get(op.desde)
      if (!sha) throw new Conflicto('Una foto o un video cambió en GitHub mientras editabas. Recargá el editor y volvé a intentar.')
      poner.set(op.ruta, sha)
    }
  }

  const entradas = Object.entries(textos).map(([path, content]) => ({ path, mode: '100644', type: 'blob', content }))
  for (const [path, sha] of poner) entradas.push({ path, mode: '100644', type: 'blob', sha })
  for (const path of borrar) if (!poner.has(path)) entradas.push({ path, mode: '100644', type: 'blob', sha: null })
  return entradas
}

const limpiarResumen = (texto) =>
  String(texto ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150) || 'cambios de contenido'

export default async function handler(req, res) {
  if (!aceptar(req, res, 'POST', 'application/json')) return

  const config = leerConfig()
  if (!config.listo) return fallar(res, 503, 'sin-configurar', 'El editor todavía no está configurado en Vercel.')
  if (!paseValido(config, req)) {
    return fallar(res, 401, 'pase', 'Hace falta la clave, o pasó demasiado tiempo desde que la pusiste. Tocá Publicar de nuevo.')
  }

  let cuerpo
  try {
    cuerpo = objeto(await leerJson(req))
  } catch {
    return fallar(res, 400, 'pedido', 'El pedido llegó mal. Probá de nuevo.')
  }

  const sitio = normalizarSitio(cuerpo.sitio)
  const proyectos = normalizarProyectos(cuerpo.proyectos)
  const errores = [...sitio.errores, ...proyectos.errores]
  if (errores.length) return fallar(res, 400, 'contenido', 'Hay datos para corregir antes de publicar.', { errores })

  let operaciones
  try {
    operaciones = validarOperaciones(cuerpo.archivos, new Set(proyectos.datos.map((p) => p.carpeta)))
  } catch (error) {
    return fallar(res, 400, 'archivos', error.message)
  }

  const textos = { [RUTA_SITIO]: serializar(sitio.datos), [RUTA_PROYECTOS]: serializar(proyectos.datos) }
  const shas = Object.fromEntries(Object.entries(textos).map(([ruta, texto]) => [ruta, shaDeBlob(Buffer.from(texto, 'utf8'))]))
  const base = objeto(cuerpo.base)
  const resumen = limpiarResumen(cuerpo.resumen)
  const github = crearGitHub(config)

  try {
    for (let intento = 1; ; intento++) {
      const cabeza = await github.cabeza()
      const enRepo = await github.archivos(cabeza.arbol)

      for (const ruta of [RUTA_SITIO, RUTA_PROYECTOS]) {
        const actual = enRepo.get(ruta)
        if (typeof base[ruta] === 'string' && actual !== base[ruta] && actual !== shas[ruta]) {
          return fallar(
            res,
            409,
            'conflicto',
            'El contenido cambió en GitHub desde que abriste el editor (puede que alguien lo haya editado a mano, o que todavía se esté publicando un cambio anterior). Esperá un minuto, recargá el editor y volvé a hacer tus cambios.',
          )
        }
      }

      const arbol = await github.crearArbol(cabeza.arbol, armarEntradas(operaciones, enRepo, textos))
      if (arbol === cabeza.arbol) return responder(res, 200, { ok: true, sinCambios: true, commit: cabeza.commit, archivos: shas })

      const commit = await github.crearCommit(`Editor web: ${resumen}`, arbol, cabeza.commit)
      try {
        await github.moverRama(commit)
      } catch (error) {
        // Alguien guardó otra cosa en el medio: se vuelve a armar sobre lo último
        if (error instanceof ErrorDeGitHub && error.status === 422 && intento < 3) continue
        throw error
      }

      console.log(`[editor] publicado ${commit.slice(0, 7)}: ${resumen}`)
      return responder(res, 200, { ok: true, commit, archivos: shas })
    }
  } catch (error) {
    if (error instanceof Conflicto) return fallar(res, 409, 'conflicto', error.message)
    if (error instanceof ErrorDeGitHub) {
      const { status, codigo, mensaje } = explicarErrorDeGitHub(error)
      return fallar(res, status, codigo, mensaje)
    }
    console.error('[editor]', error)
    return fallar(res, 500, 'interno', 'Algo falló en el servidor. Probá de nuevo en un rato.')
  }
}
