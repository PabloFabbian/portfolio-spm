import { useEffect } from 'react'

const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '')

function setMeta(selector, create, value) {
  let el = document.head.querySelector(selector)
  if (!value) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement(create.tag)
    for (const [name, attr] of Object.entries(create.attrs)) el.setAttribute(name, attr)
    document.head.appendChild(el)
  }
  el.setAttribute(create.valueAttr, value)
}

const meta = (name, value) =>
  setMeta(`meta[name="${name}"]`, { tag: 'meta', attrs: { name }, valueAttr: 'content' }, value)
const og = (property, value) =>
  setMeta(`meta[property="${property}"]`, { tag: 'meta', attrs: { property }, valueAttr: 'content' }, value)
const canonical = (value) =>
  setMeta('link[rel="canonical"]', { tag: 'link', attrs: { rel: 'canonical' }, valueAttr: 'href' }, value)

/**
 * Título, descripción, dirección canónica y datos para compartir de cada página.
 * El navegador de quien visita y los buscadores que ejecutan JavaScript ven lo de cada página;
 * las redes que no lo ejecutan reciben lo mismo ya escrito en el HTML (ver vite.plugins.js).
 */
export function usePageSeo({ title, description = '', path = null, noindex = false }) {
  useEffect(() => {
    document.title = title
    const url = SITE_URL && path != null ? `${SITE_URL}${path}` : ''
    meta('description', description)
    meta('robots', noindex ? 'noindex, nofollow' : '')
    canonical(noindex ? '' : url)
    og('og:title', title)
    og('og:description', description)
    og('og:url', url)
    meta('twitter:title', title)
    meta('twitter:description', description)
  }, [title, description, path, noindex])
}
