/*
 * Proyectos del portfolio, en el orden en que aparecen.
 *
 * Cada proyecto genera su página en /proyectos/<slug>.
 * Lo que está entre [corchetes] es un dato que falta: se muestra tal cual
 * en la web hasta que se complete.
 *
 * Fotos y videos: poné los archivos en public/media/<slug>/ y escribí la
 * ruta en el campo correspondiente, por ejemplo:
 *   media: { clip: '/media/el-club-debede/clip.mp4', poster: '/media/el-club-debede/afiche.jpg' }
 *   gallery: [{ type: 'photo', src: '/media/el-club-debede/armado.jpg', ... }]
 * Mientras un campo esté vacío, se muestra la trama de puntos del diseño.
 *
 * Tonos disponibles para fondos y puntos: 'ink' (negro), 'paper' (hueso), 'rec' (rojo).
 */

export const projects = [
  {
    slug: 'el-club-debede',
    title: 'El Club Debede',
    titleLines: ['El Club', 'Debede'],
    kicker: 'Proyecto personal',
    category: 'Música en vivo',
    year: '2026 – actualidad',
    meta: 'Proyecto personal · Producción integral · 2026 – actualidad',
    tone: { bg: 'ink', dot: 'rec', size: 16 },
    summary:
      'Noches de música en vivo en bares, producidas de principio a fin: el armado, el show y los videos que lo cuentan.',
    media: {
      clip: null, // video principal en loop, sin sonido (10 a 15 s)
      poster: null, // afiche de una fecha
      posterLabel: '[Afiche de una fecha]',
      cover: null, // imagen para la tarjeta de la home
      clipLabel: '[Clip del club en loop, sin sonido · 10 a 15 s]',
      timecode: '00:00:14:07',
      specs: '4K · 25 FPS', // decorativo: confirmar con qué filma Santi
    },
    facts: [
      { label: 'Rol', value: 'Producción integral, de principio a fin' },
      { label: 'Tareas', value: 'Armado, filmación y edición' },
      { label: 'Formato', value: 'Producción de eventos musicales' },
      { label: 'Año', value: '2026 – actualidad' },
    ],
    headline: 'Mi experiencia más completa y transversal en producción.',
    body: [
      'El Club Debede es mi proyecto personal: noches de música en vivo en bares, con el foco puesto en la música.',
      'Lo produzco de principio a fin. Armo cada fecha, estoy en el show y después filmo y edito los videos que cuentan cada noche.',
      'Es donde junto todo lo que aprendí en producción: la organización previa, la resolución en vivo y el trabajo audiovisual.',
    ],
    marquee: ['Armado', 'Show', 'Filmación', 'Edición', 'Música en vivo'],
    tasksIntro: 'Cada noche del club pasa por mis manos, de la idea al video final.',
    tasks: [
      {
        tag: 'Antes',
        title: 'Producción',
        text: 'La idea de cada fecha y la organización de todo lo que tiene que pasar para que la noche salga.',
      },
      {
        tag: 'Antes',
        title: 'Armado',
        text: 'Preparar el bar para el show: el espacio, el equipo y lo que necesiten las bandas.',
      },
      {
        tag: 'Durante',
        title: 'Filmación',
        text: 'Registrar la noche mientras sucede: el show, la gente y lo que pasa atrás.',
      },
      {
        tag: 'Después',
        title: 'Edición',
        text: 'Armar los videos que cuentan cada fecha y la muestran en redes.',
      },
    ],
    galleryTitle: 'Así se vive una noche',
    gallery: [
      {
        type: 'photo',
        title: 'El armado',
        label: '[Foto · el armado]',
        caption: '[Cómo se preparó el bar para esa fecha]',
        tone: { bg: 'rec', dot: 'ink' },
        src: null,
      },
      {
        type: 'clip',
        title: 'El show',
        label: '[Clip · 10 a 15 s]',
        timecode: '00:00:12:04',
        tone: { dot: 'rec' },
        src: null,
      },
      {
        type: 'photo',
        title: 'La gente',
        label: '[Foto · la gente]',
        caption: '[Cómo se llenó el bar esa noche]',
        tone: { bg: 'paper', dot: 'ink' },
        src: null,
      },
      {
        type: 'clip',
        title: 'Detrás',
        label: '[Clip · 10 a 15 s]',
        timecode: '00:00:09:18',
        tone: { dot: 'paper' },
        src: null,
      },
    ],
    credits: [
      { role: 'Idea y producción', name: 'Santiago Pérez Mejías' },
      { role: 'Filmación y edición', name: 'Santiago Pérez Mejías' },
      { role: 'Bandas', name: '[Nombres de las bandas]' },
      { role: 'Lugares', name: '[Bares donde se hizo]' },
    ],
  },

  {
    slug: 'rodajes-y-producciones',
    title: 'Rodajes y producciones',
    titleLines: ['Rodajes y', 'producciones'],
    kicker: 'Rodajes',
    category: 'Coberturas · Videoclips · Rodajes',
    year: '[Años]',
    meta: 'Cobertura de alfombra roja · Videoclips · Rodajes',
    tone: { bg: 'rec', dot: 'ink', size: 12 },
    summary:
      'Coberturas de alfombra roja, videoclips y rodajes de la facultad: del evento a la edición final.',
    media: { clip: null, poster: null, cover: null, clipLabel: '[Clip en loop, sin sonido · 10 a 15 s]', timecode: '00:00:21:12' },
    facts: [
      { label: 'Rol', value: 'Cobertura, filmación y edición' },
      { label: 'Formatos', value: 'Alfombra roja, videoclips y rodajes' },
      { label: 'Incluye', value: 'Pesar · [otros rodajes]' },
      { label: 'Año', value: '[Completar]' },
    ],
    headline: 'Tomas pensadas con intención, del rodaje a la edición.',
    body: [
      'Acá junto coberturas, videoclips y rodajes: desde notas en una alfombra roja hasta videoclips filmados y editados por mí.',
      'En los videoclips escucho la canción hasta saberla de memoria, para que cada corte caiga en cada golpe.',
      '[Contar los rodajes de la facultad y el rol en cada uno]',
    ],
    marquee: ['Cobertura', 'Alfombra roja', 'Videoclips', 'Filmación', 'Edición'],
    galleryTitle: 'Del set a la edición',
    credits: [
      { role: 'Filmación y edición', name: 'Santiago Pérez Mejías' },
      { role: 'Producciones', name: '[Nombres de cada rodaje]' },
    ],
  },

  {
    slug: 'gonna-go',
    title: 'Gonna Go',
    titleLines: ['Gonna', 'Go'],
    kicker: 'Sonido en vivo',
    category: 'Sonido en vivo',
    year: '2021',
    meta: 'Sonido en vivo · Asistente de sonido · 2021',
    tone: { bg: 'paper', dot: 'ink', size: 18 },
    summary: '[Qué es Gonna Go y qué hacía Santi ahí, en una línea]',
    media: { clip: null, poster: null, cover: null, clipLabel: '[Clip en loop, sin sonido · 10 a 15 s]', timecode: '00:00:07:03' },
    facts: [
      { label: 'Rol', value: 'Asistente de sonido' },
      { label: 'Área', value: 'Sonido en vivo' },
      { label: 'Formato', value: '[Completar]' },
      { label: 'Año', value: '2021' },
    ],
    headline: '[Una frase que resuma el trabajo en Gonna Go]',
    body: ['[Qué es Gonna Go]', '[Qué tareas hacía Santi y con quién trabajaba]'],
    credits: [{ role: 'Asistencia de sonido', name: 'Santiago Pérez Mejías' }],
  },

  {
    slug: 'television-barata',
    title: 'Televisión Barata',
    titleLines: ['Televisión', 'Barata'],
    kicker: 'Programa',
    category: 'Programa',
    year: '[Año]',
    meta: 'Programa · Producción audiovisual',
    tone: { bg: 'ink', dot: 'paper', size: 10 },
    summary:
      'Un programa hecho entre amigos que, en lo audiovisual, se veía como uno de primera línea.',
    media: { clip: null, poster: null, cover: null, clipLabel: '[Clip del programa, sin sonido · 10 a 15 s]', timecode: '00:00:33:20' },
    facts: [
      { label: 'Rol', value: 'Producción audiovisual' },
      { label: 'Formato', value: 'Programa' },
      { label: 'Preparación', value: 'Un mes de preproducción audiovisual' },
      { label: 'Año', value: '[Completar]' },
    ],
    headline: 'Un programa casero con terminación de primera línea.',
    body: [
      'Antes de salir, pasamos un mes preparando toda la parte audiovisual para que el programa se viera como uno de primera línea.',
      '[Qué hacía Santi en cada emisión]',
    ],
    credits: [
      { role: 'Producción audiovisual', name: 'Santiago Pérez Mejías' },
      { role: 'Equipo', name: '[Nombres]' },
    ],
  },

  {
    slug: 'shows-y-festivales',
    title: 'Shows y festivales',
    titleLines: ['Shows y', 'festivales'],
    kicker: 'Eventos en vivo',
    category: 'Eventos en vivo',
    year: '[Fechas]',
    meta: 'Eventos en vivo · Asistencia de producción',
    tone: { bg: 'rec', dot: 'ink', size: 14 },
    summary: 'Producción en vivo: estar al pie del cañón para que el show salga.',
    media: { clip: null, poster: null, cover: null, clipLabel: '[Clip de un show, sin sonido · 10 a 15 s]', timecode: '00:00:18:09' },
    facts: [
      { label: 'Rol', value: 'Asistencia y apoyo general de producción' },
      { label: 'Formato', value: 'Eventos musicales en vivo y festivales' },
      { label: 'Festivales', value: 'Lollapalooza Argentina · [otros]' },
      { label: 'Años', value: '[Completar]' },
    ],
    headline: 'Al pie del cañón para todo.',
    body: [
      'Trabajé en shows y festivales, entre ellos Lollapalooza Argentina.',
      'Fui el enlace con los artistas: si necesitaban algo, se lo alcanzaba. Armé escenografía con el área de arte y, durante el show, tiré cables, afiné guitarras y estuve atrás de la consola de audio para que no pasara nada.',
    ],
    marquee: ['Artistas', 'Escenografía', 'Cables', 'Consola', 'En vivo'],
    tasksIntro: 'De la escenografía al final del show.',
    tasks: [
      { tag: 'Antes', title: 'Escenografía', text: 'Armar la escenografía junto al área de arte.' },
      { tag: 'Durante', title: 'Artistas', text: 'Ser el enlace con los artistas y resolver lo que necesiten.' },
      { tag: 'Durante', title: 'Técnica', text: 'Tirar cables, afinar guitarras y asistir atrás de la consola de audio.' },
    ],
    credits: [{ role: 'Asistencia de producción', name: 'Santiago Pérez Mejías' }],
  },
]

/* Galería genérica para los proyectos que todavía no tienen material */
export function galleryFor(project) {
  if (project.gallery) return project.gallery
  return [
    { type: 'photo', title: 'Foto 1', label: '[Foto 1]', caption: '[Cómo se hizo esta toma]', tone: { bg: 'rec', dot: 'ink' }, src: null },
    { type: 'clip', title: 'Clip 1', label: '[Clip · 10 a 15 s]', timecode: '00:00:10:00', tone: { dot: 'rec' }, src: null },
    { type: 'photo', title: 'Foto 2', label: '[Foto 2]', caption: '[Cómo se hizo esta toma]', tone: { bg: 'paper', dot: 'ink' }, src: null },
    { type: 'clip', title: 'Clip 2', label: '[Clip · 10 a 15 s]', timecode: '00:00:12:00', tone: { dot: 'paper' }, src: null },
  ]
}

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
