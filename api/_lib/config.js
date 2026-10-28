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
