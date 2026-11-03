/*
 * Configuración del editor. Todo sale de las variables de entorno de Vercel
 * (Settings → Environment Variables), nunca del código ni del navegador:
 *
 *   GITHUB_TOKEN    permiso de GitHub para guardar (fine-grained, Contents: Read and write)
 *   ADMIN_PASSWORD  la clave para publicar (12 caracteres o más)
 *   GITHUB_REPO     opcional: usuario/repositorio (si no está, se usa el repo conectado a Vercel)
 *   GITHUB_BRANCH   opcional: rama donde guardar (si no está, la del deploy, o main)
 */
export const LARGO_MINIMO_DE_CLAVE = 12

export function leerConfig() {
  const env = process.env
  const token = String(env.GITHUB_TOKEN ?? '').trim()
  const clave = String(env.ADMIN_PASSWORD ?? '').trim()
  const repoDeVercel =
    env.VERCEL_GIT_REPO_OWNER && env.VERCEL_GIT_REPO_SLUG ? `${env.VERCEL_GIT_REPO_OWNER}/${env.VERCEL_GIT_REPO_SLUG}` : ''
  const repo = String(env.GITHUB_REPO ?? '').trim() || repoDeVercel
  const rama = String(env.GITHUB_BRANCH ?? '').trim() || env.VERCEL_GIT_COMMIT_REF || 'main'
  const api = String(env.GITHUB_API_URL ?? '').trim().replace(/\/+$/, '') || 'https://api.github.com'

  const problemas = []
  if (!token) problemas.push('Falta GITHUB_TOKEN, el permiso de GitHub para guardar los cambios.')
  if (!clave) problemas.push('Falta ADMIN_PASSWORD, la clave para publicar.')
  else if (clave.length < LARGO_MINIMO_DE_CLAVE) {
    problemas.push(`ADMIN_PASSWORD tiene que tener al menos ${LARGO_MINIMO_DE_CLAVE} caracteres.`)
  }
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    problemas.push('No sé en qué repositorio guardar: cargá GITHUB_REPO con usuario/repositorio.')
  }
  if (!/^[\w./-]+$/.test(rama)) problemas.push('GITHUB_BRANCH no es un nombre de rama válido.')

  return { token, clave, repo, rama, api, problemas, listo: problemas.length === 0 }
}

/*
 * Videos en Cloudinary (opcional). Con estas tres variables, los videos se suben directo
 * desde el navegador a la cuenta de Cloudinary y pueden pesar hasta 100 MB; sin ellas, se
 * guardan en GitHub y pueden pesar hasta 4 MB.
 *
 *   CLOUDINARY_CLOUD_NAME  el "Cloud name" de la cuenta
 *   CLOUDINARY_API_KEY     la "API Key"
 *   CLOUDINARY_API_SECRET  el "API Secret" (secreto: solo acá, nunca en el código)
 *
 * También se acepta CLOUDINARY_URL (cloudinary://API_KEY:API_SECRET@CLOUD_NAME), y si la
 * cuenta pide firmas SHA-256, CLOUDINARY_SIGNATURE_ALGORITHM=sha256.
 */
export function leerCloudinary() {
  const env = process.env
  const leer = (nombre) => String(env[nombre] ?? '').trim()
  const desdeUrl = /cloudinary:\/\/([^:@\s]+):([^@\s]+)@([^/?#\s]+)/.exec(leer('CLOUDINARY_URL')) ?? []
  const cuenta = leer('CLOUDINARY_CLOUD_NAME') || desdeUrl[3] || ''
  const apiKey = leer('CLOUDINARY_API_KEY') || desdeUrl[1] || ''
  const secreto = leer('CLOUDINARY_API_SECRET') || desdeUrl[2] || ''
  const algoritmo = /^sha-?256$/i.test(leer('CLOUDINARY_SIGNATURE_ALGORITHM')) ? 'sha256' : 'sha1'
  const megas = Number(leer('CLOUDINARY_MAX_MB'))
  const pesoMaximo = Math.round((megas > 0 ? Math.min(megas, 2000) : 100) * 1024 * 1024)
  const api = leer('CLOUDINARY_API_URL').replace(/\/+$/, '') || 'https://api.cloudinary.com'

  const avisos = []
  if (!cuenta && !apiKey && !secreto) return { activo: false, avisos }

  const quePasa = 'Hasta que se corrija, los videos se guardan en GitHub y pueden pesar hasta 4 MB.'
  if (!cuenta) avisos.push(`Falta CLOUDINARY_CLOUD_NAME, el «Cloud name» de Cloudinary. ${quePasa}`)
  else if (!/^[a-z0-9][a-z0-9_-]{0,62}$/i.test(cuenta)) {
    avisos.push(`CLOUDINARY_CLOUD_NAME no parece un «Cloud name» de Cloudinary (son letras y números, sin espacios). ${quePasa}`)
  }
  if (!apiKey) avisos.push(`Falta CLOUDINARY_API_KEY, la «API Key» de Cloudinary. ${quePasa}`)
  else if (!/^\d{5,30}$/.test(apiKey)) avisos.push(`CLOUDINARY_API_KEY no parece una «API Key» de Cloudinary (son solo números). ${quePasa}`)
  if (!secreto) avisos.push(`Falta CLOUDINARY_API_SECRET, el «API Secret» de Cloudinary. ${quePasa}`)
  else if (!/^[\w-]{10,100}$/.test(secreto)) {
    avisos.push(`CLOUDINARY_API_SECRET no parece un «API Secret» de Cloudinary (¿quedó copiado con espacios o con < >?). ${quePasa}`)
  }

  return { activo: avisos.length === 0, cuenta, apiKey, secreto, algoritmo, pesoMaximo, api, avisos }
}
