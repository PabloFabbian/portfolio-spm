/*
 * Datos generales del sitio.
 * Todo el texto de la home sale de acá: para cambiar un dato no hace
 * falta tocar los componentes.
 */

export const site = {
  name: 'Santiago Pérez Mejías',
  nameLines: ['Santiago', 'Pérez', 'Mejías'],
  role: 'Productor audiovisual',
  quote: 'Lo más personal es lo más creativo.',
  year: 2026,

  // Palabras de la cinta que pasa debajo de la portada
  tags: ['Producción integral', 'Rodajes', 'Eventos en vivo', 'Apoyo a artistas', 'Escenografía'],

  about: {
    eyebrow: '(01) Sobre mí',
    title: 'Detrás de cada proyecto',
    paragraphs: [
      'Estudiante vinculado al ámbito audiovisual, con experiencia en producción de eventos musicales y participación en rodajes y proyectos académicos. Busca seguir desarrollándose en producción audiovisual, especialmente en cine y televisión.',
      'Abierto a trabajar con productoras audiovisuales de cine y televisión, productoras de videoclips y shows musicales, en equipo y en distintos roles de producción.',
    ],
    facts: [
      {
        label: 'Rol principal',
        value:
          'Producción integral y asistencia en rodajes y eventos: apoyo a artistas, montaje de escenografía, tendido de cables y asistencia durante shows, entre otras tareas. Dirección.',
      },
      {
        label: 'Formación',
        value:
          'Tecnicatura en Producción Audiovisual, ETER (2024 – actualidad) · Ingeniería en Sonido, Orión (finalizado)',
      },
      { label: 'Ubicación', value: 'Buenos Aires, Argentina' },
      { label: 'Idiomas', value: 'Inglés B2 (First Certificate in English, Cambridge)' },
    ],
  },

  contact: {
    email: 'santiago.perez.mejias@gmail.com',
    instagram: 'santii_pe',
    whatsapp: {
      display: '+54 9 11 6176-1500',
      number: '5491161761500',
      // Mensaje que aparece escrito al abrir WhatsApp
      message: 'Hola Santiago, vi tu portfolio y quería hablar con vos.',
    },
  },
}

export const links = {
  email: `mailto:${site.contact.email}`,
  instagram: `https://instagram.com/${site.contact.instagram}`,
  whatsapp: `https://wa.me/${site.contact.whatsapp.number}?text=${encodeURIComponent(site.contact.whatsapp.message)}`,
}
