/*
 * Traduce contenido/proyectos.js (escrito en castellano, para editar sin saber código)
 * a los datos que usan los componentes, y suma las fotos y videos de cada carpeta
 * contenido/proyectos/<carpeta>/ según el nombre del archivo.
 * Los textos se cambian en contenido/proyectos.js.
 */
import contenido from '../../contenido/proyectos.js'
import { groupByFolder, slugify } from './media'

const files = groupByFolder(
  import.meta.glob(
    '/contenido/proyectos/*/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm,JPG,JPEG,PNG,WEBP,AVIF,GIF,MP4,WEBM}',
    { eager: true, query: '?url', import: 'default' },
  ),
)

const COLORS = { negro: 'ink', hueso: 'paper', rojo: 'rec' }
const color = (value, fallback) => COLORS[slugify(value)] ?? fallback

// Detalles decorativos que no necesitan editarse
const DOT_SIZES = [16, 12, 18, 10, 14]
const TIMECODES = ['00:00:14:07', '00:00:21:12', '00:00:07:03', '00:00:33:20', '00:00:18:09']
const GALLERY_TIMECODES = ['00:00:12:04', '00:00:09:18', '00:00:15:02', '00:00:11:21', '00:00:08:16', '00:00:13:05']

const isVideoType = (tipo) => /^(video|clip)/.test(slugify(tipo))

function buildGallery(galeria = {}, media) {
  const pieces = galeria.piezas ?? []

  // Tantas piezas como las escritas o como los archivos galeria-N subidos (lo que sea mayor)
  let count = pieces.length
  for (const key of Object.keys(media)) {
    const match = /^galeria-(\d+)$/.exec(key)
    if (match) count = Math.max(count, Number(match[1]))
  }

  let photos = 0
  let videos = 0
  return Array.from({ length: count }, (_, i) => {
    const piece = pieces[i] ?? {}
    const file = media[`galeria-${i + 1}`]
    const isVideo = file ? file.kind === 'video' : isVideoType(piece.tipo ?? (i % 2 ? 'video' : 'foto'))

    if (isVideo) {
      videos += 1
      return {
        type: 'clip',
        title: piece.titulo ?? `Video ${videos}`,
        label: `[Falta galeria-${i + 1}.mp4]`,
        timecode: GALLERY_TIMECODES[i % GALLERY_TIMECODES.length],
        tone: { dot: videos % 2 ? 'rec' : 'paper' },
        src: file?.url ?? null,
      }
    }
    photos += 1
    return {
      type: 'photo',
      title: piece.titulo ?? `Foto ${photos}`,
      label: `[Falta galeria-${i + 1}.jpg]`,
      caption: piece.comoSeHizo ?? null,
      tone: { bg: photos % 2 ? 'rec' : 'paper', dot: 'ink' },
      src: file?.url ?? null,
    }
  })
}

function buildProject(p, index) {
  const slug = slugify(p.carpeta || p.titulo)
  const media = files[slug] ?? {}
  const main = media['video-principal'] ?? media['imagen-principal']
  const poster = media.afiche?.kind === 'image' ? media.afiche.url : null
  const imageUrl = (file) => (file?.kind === 'image' ? file.url : null)

  const tasks = (p.queHice?.tareas ?? []).map((t) => ({ tag: t.momento, title: t.titulo, text: t.texto }))

  return {
    slug,
    title: p.titulo ?? '',
    titleLines: p.tituloEnRenglones?.length ? p.tituloEnRenglones : [p.titulo ?? ''],
    kicker: p.etiqueta ?? p.categoria ?? '',
    category: p.categoria ?? '',
    year: p.anio ?? '',
    meta: p.lineaEnLaLista ?? [p.categoria, p.anio].filter(Boolean).join(' · '),
    tone: {
      bg: color(p.colores?.fondo, 'ink'),
      dot: color(p.colores?.puntos, 'rec'),
      size: DOT_SIZES[index % DOT_SIZES.length],
    },
    summary: p.bajada ?? '',
    media: {
      clip: main?.kind === 'video' ? main.url : null,
      image: imageUrl(main),
      poster,
      cover: imageUrl(media.tarjeta) ?? poster ?? imageUrl(main),
      clipLabel: '[Falta video-principal.mp4 · en loop, sin sonido, 10 a 15 s]',
      shortClipLabel: '[Falta video-principal.mp4]',
      posterLabel: '[Falta afiche.jpg]',
      coverLabel: '[Falta tarjeta.jpg]',
      timecode: TIMECODES[index % TIMECODES.length],
      specs: p.formatoDeCamara ?? null,
    },
    facts: (p.ficha ?? []).map((f) => ({ label: f.dato, value: f.valor })),
    headline: p.frase ?? '',
    body: p.texto ?? [],
    marquee: p.cinta?.length ? p.cinta : null,
    tasksIntro: p.queHice?.intro ?? null,
    tasks: tasks.length ? tasks : null,
    galleryTitle: p.galeria?.titulo ?? 'Clips y fotos',
    gallery: buildGallery(p.galeria, media),
    credits: (p.creditos ?? []).map((c) => ({ role: c.rol, name: c.nombre })),
  }
}

export const projects = contenido.map(buildProject)

export function findProject(slug) {
  const index = projects.findIndex((p) => p.slug === slug)
  if (index === -1) return null
  return {
    project: projects[index],
    index,
    next: projects[(index + 1) % projects.length],
    total: projects.length,
  }
}