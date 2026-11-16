/*
 * Plugins propios de Vite:
 * - apiLocal: en `npm run dev` atiende /api/* con los mismos archivos que usa Vercel,
 *   para poder probar el editor en la compu (las claves van en .env.local, que no se sube).
 * - versionJson: al compilar, deja /version.json con el commit publicado; el editor lo
 *   consulta para avisar cuándo un cambio ya está en la web.
 * - seo: arma con el contenido publicado los datos para buscadores (JSON-LD), /robots.txt,
 *   /sitemap.xml y una copia del HTML por proyecto con su propio título y descripción, para
 *   que WhatsApp, Instagram y Google lo lean sin ejecutar JavaScript.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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

const slugify = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const escaparHtml = (texto) =>
  String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const leerJson = (ruta) => JSON.parse(readFileSync(ruta, 'utf8'))

export function seo() {
  let raiz = process.cwd()
  let salida = 'dist'
  let sitio = {}
  let proyectos = []
  let urlBase = ''
  let construyendo = false

  return {
    name: 'spm-seo',
    configResolved(config) {
      raiz = config.root
      construyendo = config.command === 'build'
      salida = resolve(config.root, config.build.outDir)
      const env = loadEnv(config.mode, config.root, 'VITE_')
      urlBase = String(process.env.VITE_SITE_URL || env.VITE_SITE_URL || '').replace(/\/+$/, '')
      sitio = leerJson(resolve(raiz, 'contenido/sitio.json'))
      proyectos = leerJson(resolve(raiz, 'contenido/proyectos.json')).map((p) => ({
        slug: slugify(p.carpeta || p.titulo),
        titulo: p.titulo ?? '',
        descripcion: /^\[/.test(p.bajada ?? '') ? '' : (p.bajada ?? ''),
      }))
    },
    transformIndexHtml() {
      const nombre = sitio.nombre ?? ''
      const contacto = sitio.contacto ?? {}
      const instagram = String(contacto.instagram ?? '').replace(/^@/, '')
      const persona = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: nombre,
        jobTitle: sitio.profesion ?? '',
        ...(urlBase && { url: `${urlBase}/`, image: `${urlBase}/imagen-para-compartir.jpg` }),
        ...(contacto.email && { email: contacto.email }),
        ...(instagram && { sameAs: [`https://instagram.com/${instagram}`] }),
        knowsAbout: sitio.cinta ?? [],
        address: { '@type': 'PostalAddress', addressLocality: 'Buenos Aires', addressCountry: 'AR' },
      }
      const json = JSON.stringify(persona).replace(/</g, '\\u003c')
      return [{ tag: 'script', attrs: { type: 'application/ld+json' }, children: json, injectTo: 'head' }]
    },
    closeBundle() {
      if (!construyendo || !urlBase) return
      const base = resolve(salida, 'index.html')
      let html
      try {
        html = readFileSync(base, 'utf8')
      } catch {
        return
      }

      for (const p of proyectos) {
        if (!p.slug) continue
        const titulo = `${p.titulo} · ${sitio.nombre ?? ''}`
        const descripcion = p.descripcion || `${p.titulo}, proyecto de ${sitio.nombre ?? ''}.`
        const direccion = `${urlBase}/proyectos/${p.slug}`
        const pagina = html
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escaparHtml(titulo)}</title>`)
          .replace(/(<meta name="description"\s+content=")[^"]*(")/, `$1${escaparHtml(descripcion)}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escaparHtml(titulo)}$2`)
          .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escaparHtml(descripcion)}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escaparHtml(direccion)}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escaparHtml(titulo)}$2`)
          .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escaparHtml(descripcion)}$2`)
          .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escaparHtml(direccion)}$2`)
        const destino = resolve(salida, 'proyectos', p.slug, 'index.html')
        mkdirSync(dirname(destino), { recursive: true })
        writeFileSync(destino, pagina)
      }

      const hoy = new Date().toISOString().slice(0, 10)
      const direcciones = ['/', ...proyectos.filter((p) => p.slug).map((p) => `/proyectos/${p.slug}`)]
      const mapa = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...direcciones.map((d) => `  <url><loc>${escaparHtml(urlBase + d)}</loc><lastmod>${hoy}</lastmod></url>`),
        '</urlset>',
        '',
      ].join('\n')
      writeFileSync(resolve(salida, 'sitemap.xml'), mapa)
      writeFileSync(resolve(salida, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${urlBase}/sitemap.xml\n`)
    },
  }
}
