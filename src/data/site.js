/*
 * Traduce contenido/sitio.json a los datos que usan los componentes.
 * El contenido se cambia desde el editor (/editar) o, a mano, en contenido/sitio.json.
 */
import publicado from '../../contenido/sitio.json'
import { groupByFolder } from './media'
import { archivosDeVistaPrevia, vistaPrevia } from './vista-previa'

const contenido = vistaPrevia?.sitio ?? publicado
const sobreMi = contenido.sobreMi ?? {}
const contacto = contenido.contacto ?? {}
const name = contenido.nombre ?? ''

export const site = {
  name,
  nameLines: contenido.nombreEnRenglones?.length ? contenido.nombreEnRenglones : name.split(' '),
  role: contenido.profesion ?? '',
  quote: contenido.frase ?? '',
  year: contenido.anio ?? new Date().getFullYear(),
  tags: contenido.cinta ?? [],
  about: {
    eyebrow: '(01) Sobre mí',
    title: sobreMi.titulo ?? '',
    paragraphs: sobreMi.parrafos ?? [],
    facts: (sobreMi.datos ?? []).map((item) => ({ label: item.dato, value: item.valor })),
  },
  contact: {
    email: contacto.email ?? '',
    instagram: String(contacto.instagram ?? '').replace(/^@/, ''),
    whatsapp: {
      display: contacto.whatsappVisible ?? '',
      number: String(contacto.whatsappNumero ?? '').replace(/\D/g, ''),
      message: contacto.whatsappMensaje ?? '',
    },
  },
}

export const links = {
  email: `mailto:${site.contact.email}`,
  instagram: `https://instagram.com/${site.contact.instagram}`,
  whatsapp: `https://wa.me/${site.contact.whatsapp.number}?text=${encodeURIComponent(site.contact.whatsapp.message)}`,
}

// Fotos de contenido/fotos/, por nombre de archivo (portada-1, portada-2, sobre-mi)
const fotos =
  groupByFolder(
    vistaPrevia
      ? archivosDeVistaPrevia('/contenido/fotos/')
      : import.meta.glob('/contenido/fotos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
          eager: true,
          query: '?url',
          import: 'default',
        }),
  ).fotos ?? {}

const photo = (file, alt) => (file ? { src: file.url, width: 1200, height: 1200, alt } : null)

export const photos = {
  frente: photo(fotos['portada-1'], `${name}`),
  perfil: photo(fotos['portada-2'], `${name}`),
  sobreMi: photo(fotos['sobre-mi'], `Retrato de ${name}`),
}
