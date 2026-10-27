/*
 * ============================================================
 *  TEXTOS GENERALES DE LA WEB (portada, sobre mí y contacto)
 * ============================================================
 *  Cambiá solo lo que está entre comillas 'así'.
 *  No borres las comillas, las comas del final ni los [ ] y { }.
 *  Guía completa: COMO-EDITAR.md (en la carpeta principal).
 */

export default {
    // Nombre completo: arriba a la izquierda, en el pie y en la pestaña del navegador
    nombre: 'Santiago Pérez Mejías',

    // Nombre gigante de la portada: un renglón por línea (hasta 3)
    nombreEnRenglones: ['Santiago', 'Pérez', 'Mejías'],

    // Recuadro negro debajo del nombre
    profesion: 'Productor audiovisual',

    // Frase de la portada (sin comillas: se agregan solas)
    frase: 'Lo más personal es lo más creativo.',

    // Palabras de la cinta negra que pasa debajo de la portada
    cinta: ['Producción integral', 'Rodajes', 'Eventos en vivo', 'Apoyo a artistas', 'Escenografía'],

    // Año que aparece en "Portfolio 2026" y en el © del pie
    anio: 2026,

    // ---------- SOBRE MÍ ----------
    sobreMi: {
        titulo: 'Detrás de cada proyecto',

        // Un texto por párrafo
        parrafos: [
            'Estudiante vinculado al ámbito audiovisual, con experiencia en producción de eventos musicales y participación en rodajes y proyectos académicos. Busca seguir desarrollándose en producción audiovisual, especialmente en cine y televisión.',
            'Abierto a trabajar con productoras audiovisuales de cine y televisión, productoras de videoclips y shows musicales, en equipo y en distintos roles de producción.',
        ],

        // Tabla de abajo: cada renglón tiene un dato (izquierda) y su valor (derecha)
        datos: [
            {
                dato: 'Rol principal',
                valor:
                    'Producción integral y asistencia en rodajes y eventos: apoyo a artistas, montaje de escenografía, tendido de cables y asistencia durante shows, entre otras tareas. Dirección.',
            },
            {
                dato: 'Formación',
                valor: 'Tecnicatura en Producción Audiovisual, ETER (2024 – actualidad) · Ingeniería en Sonido, Orión (finalizado)',
            },
            { dato: 'Ubicación', valor: 'Buenos Aires, Argentina' },
            { dato: 'Idiomas', valor: 'Inglés B2 (First Certificate in English, Cambridge)' },
        ],
    },

    // ---------- CONTACTO ----------
    contacto: {
        email: 'santiago.perez.mejias@gmail.com',

        // Usuario de Instagram, sin @
        instagram: 'santii_pe',

        // WhatsApp como se lee en la web
        whatsappVisible: '+54 9 11 6176-1500',
        // WhatsApp para el botón: código de país + 9 + área + número, todo junto
        whatsappNumero: '5491161761500',
        // Mensaje que aparece ya escrito cuando alguien toca el botón de WhatsApp
        whatsappMensaje: 'Hola Santiago, vi tu portfolio y quería hablar con vos.',
    },
}