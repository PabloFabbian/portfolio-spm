/*
 * Lo mínimo de la API de GitHub para guardar un cambio como un commit:
 * leer la rama, crear blobs (archivos), un árbol y un commit, y mover la rama.
 */
import { createHash } from 'node:crypto'

export class ErrorDeGitHub extends Error {
  constructor(status, mensaje) {
    super(mensaje)
    this.status = status
  }
}

/** El mismo identificador que GitHub le da a un archivo (sirve para comparar versiones) */
export function shaDeBlob(datos) {
  return createHash('sha1').update(`blob ${datos.length}\0`).update(datos).digest('hex')
}

export function crearGitHub(config) {
  async function pedir(metodo, ruta, cuerpo) {
    let respuesta
    try {
      respuesta = await fetch(`${config.api}/repos/${config.repo}${ruta}`, {
        method: metodo,
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'portfolio-spm-editor',
          ...(cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      })
    } catch (error) {
      throw new ErrorDeGitHub(0, error.message)
    }

    const texto = await respuesta.text()
    let datos
    try {
      datos = texto ? JSON.parse(texto) : null
    } catch {
      datos = { message: texto.slice(0, 200) }
    }
    if (!respuesta.ok) throw new ErrorDeGitHub(respuesta.status, datos?.message ?? respuesta.statusText)
    return datos
  }

  return {
    /** Último commit de la rama y su árbol */
    async cabeza() {
      const ref = await pedir('GET', `/git/ref/heads/${config.rama}`)
      const commit = await pedir('GET', `/git/commits/${ref.object.sha}`)
      return { commit: ref.object.sha, arbol: commit.tree.sha }
    },

    /** Todos los archivos del repositorio: Map(ruta → sha) */
    async archivos(arbol) {
      const datos = await pedir('GET', `/git/trees/${arbol}?recursive=1`)
      if (datos.truncated) throw new ErrorDeGitHub(507, 'El repositorio es demasiado grande para el editor.')
      return new Map(datos.tree.filter((entrada) => entrada.type === 'blob').map((entrada) => [entrada.path, entrada.sha]))
    },

    async crearBlob(datos) {
      const blob = await pedir('POST', '/git/blobs', { content: datos.toString('base64'), encoding: 'base64' })
      return blob.sha
    },

    async crearArbol(base, entradas) {
      const arbol = await pedir('POST', '/git/trees', { base_tree: base, tree: entradas })
      return arbol.sha
    },

    async crearCommit(mensaje, arbol, padre) {
      const commit = await pedir('POST', '/git/commits', { message: mensaje, tree: arbol, parents: [padre] })
      return commit.sha
    },

    /** Avanza la rama al commit nuevo. Si alguien guardó otra cosa en el medio, GitHub responde 422. */
    async moverRama(commit) {
      await pedir('PATCH', `/git/refs/heads/${config.rama}`, { sha: commit, force: false })
    },
  }
}

/** Traduce un error de GitHub a un mensaje que se entienda en el editor */
export function explicarErrorDeGitHub(error) {
  const status = error?.status
  if (status === 401) {
    return {
      status: 502,
      codigo: 'github-permiso',
      mensaje: 'GitHub rechazó el permiso (GITHUB_TOKEN): puede que haya vencido. Hay que crear uno nuevo y cargarlo en Vercel.',
    }
  }
  if (status === 403) {
    return {
      status: 502,
      codigo: 'github-permiso',
      mensaje:
        'GitHub no dejó guardar. Revisá que el permiso tenga «Contents: Read and write» para este repositorio, o probá de nuevo en un rato.',
    }
  }
  if (status === 404) {
    return {
      status: 502,
      codigo: 'github-repo',
      mensaje: 'No encuentro el repositorio o la rama en GitHub. Revisá GITHUB_REPO y que el permiso incluya ese repositorio.',
    }
  }
  if (status === 507) return { status: 507, codigo: 'github-grande', mensaje: error.message }
  if (status === 0) {
    return { status: 502, codigo: 'github-conexion', mensaje: 'No se pudo conectar con GitHub. Probá de nuevo en un rato.' }
  }
  return { status: 502, codigo: 'github', mensaje: `GitHub respondió con un error (${status}). Probá de nuevo en un rato.` }
}
