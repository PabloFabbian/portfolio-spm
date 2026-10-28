/*
 * Plugins propios de Vite:
 * - apiLocal: en `npm run dev` atiende /api/* con los mismos archivos que usa Vercel,
 *   para poder probar el editor en la compu (las claves van en .env.local, que no se sube).
 * - versionJson: al compilar, deja /version.json con el commit publicado; el editor lo
 *   consulta para avisar cuándo un cambio ya está en la web.
 */
import { loadEnv } from 'vite'

export function apiLocal() {
  return {
    name: 'spm-api-local',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      for (const [nombre, valor] of Object.entries(env)) {
        if (process.env[nombre] === undefined) process.env[nombre] = valor
      }

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? '/', 'http://localhost')

        if (url.pathname === '/version.json') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ commit: null }))
          return
        }

        const nombre = /^\/api\/([a-z-]+)\/?$/.exec(url.pathname)?.[1]
        if (!nombre) return next()

        let modulo
        try {
          modulo = await server.ssrLoadModule(`/api/${nombre}.js`)
        } catch {
          res.statusCode = 404
          res.end('No existe')
          return
        }

        try {
          const partes = []
          for await (const parte of req) partes.push(parte)
          const crudo = Buffer.concat(partes)
          const tipo = String(req.headers['content-type'] ?? '')
          req.query = Object.fromEntries(url.searchParams)
          req.body = crudo
          if (tipo.includes('application/json')) {
            // Igual que en Vercel: si el JSON viene roto, el handler recibe el texto y responde 400
            try {
              req.body = crudo.length ? JSON.parse(crudo.toString('utf8')) : {}
            } catch {
              req.body = crudo.toString('utf8')
            }
          }
          await modulo.default(req, res)
        } catch (error) {
          server.config.logger.error(`[api] ${error.stack ?? error}`)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: false, codigo: 'interno', mensaje: 'Error del servidor local.' }))
          }
        }
      })
    },
  }
}

export function versionJson() {
  return {
    name: 'spm-version-json',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ commit: process.env.VERCEL_GIT_COMMIT_SHA || null }),
      })
    },
  }
}
