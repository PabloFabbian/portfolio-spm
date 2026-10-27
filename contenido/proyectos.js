/*
 * ============================================================
 *  PROYECTOS
 * ============================================================
 *  - Cada bloque entre { } es un proyecto. El orden de esta lista
 *    es el orden en la web.
 *  - Las fotos y videos de cada proyecto van en
 *    contenido/proyectos/<carpeta>/ con nombres fijos
 *    (tarjeta, video-principal, afiche, galeria-1, galeria-2...).
 *    No hace falta escribirlos acá: se toman solos.
 *  - Lo que está entre [corchetes] es un dato que falta: se ve así
 *    en la web hasta que lo completes.
 *  - Cambiá solo lo que está entre comillas 'así'. No borres las
 *    comillas, las comas del final ni los [ ] y { }.
 *  Guía completa: COMO-EDITAR.md (en la carpeta principal).
 */

export default [
    // ============ EL CLUB DEBEDE ============
    {
        // Nombre de la carpeta de fotos y final de la dirección web (/proyectos/el-club-debede).
        // Sin espacios, tildes ni mayúsculas.
        carpeta: 'el-club-debede',

        titulo: 'El Club Debede',
        // Título gigante de la página del proyecto, un renglón por línea
        tituloEnRenglones: ['El Club', 'Debede'],

        // Recuadro negro con el punto rojo, arriba del título
        etiqueta: 'Proyecto personal',
        // Texto de arriba a la derecha: "categoría · año"
        categoria: 'Música en vivo',
        anio: '2026 – actualidad',

        // Línea chica debajo del título en la lista de trabajos de la home
        lineaEnLaLista: 'Proyecto personal · Producción integral · 2026 – actualidad',

        // Texto al lado del título gigante
        bajada:
            'Noches de música en vivo en bares, producidas de principio a fin: el armado, el show y los videos que lo cuentan.',

        // Colores de la tarjeta en la home mientras no haya foto: 'negro', 'hueso' o 'rojo'
        colores: { fondo: 'negro', puntos: 'rojo' },

        // (Opcional) Texto chico abajo a la derecha del video principal. Borrá la línea si no corresponde.
        formatoDeCamara: '4K · 25 FPS',

        // Los recuadros debajo del video
        ficha: [
            { dato: 'Rol', valor: 'Producción integral, de principio a fin' },
            { dato: 'Tareas', valor: 'Armado, filmación y edición' },
            { dato: 'Formato', valor: 'Producción de eventos musicales' },
            { dato: 'Año', valor: '2026 – actualidad' },
        ],

        // "Sobre el proyecto": la frase grande y los párrafos
        frase: 'Mi experiencia más completa y transversal en producción.',
        texto: [
            'El Club Debede es mi proyecto personal: noches de música en vivo en bares, con el foco puesto en la música.',
            'Lo produzco de principio a fin. Armo cada fecha, estoy en el show y después filmo y edito los videos que cuentan cada noche.',
            'Es donde junto todo lo que aprendí en producción: la organización previa, la resolución en vivo y el trabajo audiovisual.',
        ],

        // (Opcional) Palabras de la cinta negra. Borrá la línea si no la querés.
        cinta: ['Armado', 'Show', 'Filmación', 'Edición', 'Música en vivo'],

        // (Opcional) Sección "Lo que hice". Borrá el bloque entero si no la querés.
        queHice: {
            intro: 'Cada noche del club pasa por mis manos, de la idea al video final.',
            tareas: [
                {
                    momento: 'Antes',
                    titulo: 'Producción',
                    texto: 'La idea de cada fecha y la organización de todo lo que tiene que pasar para que la noche salga.',
                },
                {
                    momento: 'Antes',
                    titulo: 'Armado',
                    texto: 'Preparar el bar para el show: el espacio, el equipo y lo que necesiten las bandas.',
                },
                {
                    momento: 'Durante',
                    titulo: 'Filmación',
                    texto: 'Registrar la noche mientras sucede: el show, la gente y lo que pasa atrás.',
                },
                {
                    momento: 'Después',
                    titulo: 'Edición',
                    texto: 'Armar los videos que cuentan cada fecha y la muestran en redes.',
                },
            ],
        },

        // Carrusel de fotos y videos. Cada pieza usa el archivo galeria-1, galeria-2... de la carpeta.
        // tipo: 'foto' o 'video' (si subís el archivo, se detecta solo).
        // comoSeHizo: texto que aparece al pasar el cursor por una foto (opcional).
        galeria: {
            titulo: 'Así se vive una noche',
            piezas: [
                { tipo: 'foto', titulo: 'El armado', comoSeHizo: '[Cómo se preparó el bar para esa fecha]' },
                { tipo: 'video', titulo: 'El show' },
                { tipo: 'foto', titulo: 'La gente', comoSeHizo: '[Cómo se llenó el bar esa noche]' },
                { tipo: 'video', titulo: 'Detrás' },
            ],
        },

        creditos: [
            { rol: 'Idea y producción', nombre: 'Santiago Pérez Mejías' },
            { rol: 'Filmación y edición', nombre: 'Santiago Pérez Mejías' },
            { rol: 'Bandas', nombre: '[Nombres de las bandas]' },
            { rol: 'Lugares', nombre: '[Bares donde se hizo]' },
        ],
    },

    // ============ RODAJES Y PRODUCCIONES ============
    {
        carpeta: 'rodajes-y-producciones',
        titulo: 'Rodajes y producciones',
        tituloEnRenglones: ['Rodajes y', 'producciones'],
        etiqueta: 'Rodajes',
        categoria: 'Coberturas · Videoclips · Rodajes',
        anio: '[Años]',
        lineaEnLaLista: 'Cobertura de alfombra roja · Videoclips · Rodajes',
        bajada: 'Coberturas de alfombra roja, videoclips y rodajes de la facultad: del evento a la edición final.',
        colores: { fondo: 'rojo', puntos: 'negro' },
        ficha: [
            { dato: 'Rol', valor: 'Cobertura, filmación y edición' },
            { dato: 'Formatos', valor: 'Alfombra roja, videoclips y rodajes' },
            { dato: 'Incluye', valor: 'Pesar · [otros rodajes]' },
            { dato: 'Año', valor: '[Completar]' },
        ],
        frase: 'Tomas pensadas con intención, del rodaje a la edición.',
        texto: [
            'Acá junto coberturas, videoclips y rodajes: desde notas en una alfombra roja hasta videoclips filmados y editados por mí.',
            'En los videoclips escucho la canción hasta saberla de memoria, para que cada corte caiga en cada golpe.',
            '[Contar los rodajes de la facultad y el rol en cada uno]',
        ],
        cinta: ['Cobertura', 'Alfombra roja', 'Videoclips', 'Filmación', 'Edición'],
        galeria: {
            titulo: 'Del set a la edición',
            piezas: [
                { tipo: 'foto', titulo: 'Foto 1', comoSeHizo: '[Cómo se hizo esta toma]' },
                { tipo: 'video', titulo: 'Video 1' },
                { tipo: 'foto', titulo: 'Foto 2', comoSeHizo: '[Cómo se hizo esta toma]' },
                { tipo: 'video', titulo: 'Video 2' },
            ],
        },
        creditos: [
            { rol: 'Filmación y edición', nombre: 'Santiago Pérez Mejías' },
            { rol: 'Producciones', nombre: '[Nombres de cada rodaje]' },
        ],
    },

    // ============ GONNA GO ============
    {
        carpeta: 'gonna-go',
        titulo: 'Gonna Go',
        tituloEnRenglones: ['Gonna', 'Go'],
        etiqueta: 'Sonido en vivo',
        categoria: 'Sonido en vivo',
        anio: '2021',
        lineaEnLaLista: 'Sonido en vivo · Asistente de sonido · 2021',
        bajada: '[Qué es Gonna Go y qué hacía Santi ahí, en una línea]',
        colores: { fondo: 'hueso', puntos: 'negro' },
        ficha: [
            { dato: 'Rol', valor: 'Asistente de sonido' },
            { dato: 'Área', valor: 'Sonido en vivo' },
            { dato: 'Formato', valor: '[Completar]' },
            { dato: 'Año', valor: '2021' },
        ],
        frase: '[Una frase que resuma el trabajo en Gonna Go]',
        texto: ['[Qué es Gonna Go]', '[Qué tareas hacía Santi y con quién trabajaba]'],
        galeria: {
            titulo: 'Clips y fotos',
            piezas: [
                { tipo: 'foto', titulo: 'Foto 1', comoSeHizo: '[Cómo se hizo esta toma]' },
                { tipo: 'video', titulo: 'Video 1' },
                { tipo: 'foto', titulo: 'Foto 2', comoSeHizo: '[Cómo se hizo esta toma]' },
                { tipo: 'video', titulo: 'Video 2' },
            ],
        },
        creditos: [{ rol: 'Asistencia de sonido', nombre: 'Santiago Pérez Mejías' }],
    },

    // ============ TELEVISIÓN BARATA ============
    {
        carpeta: 'television-barata',
        titulo: 'Televisión Barata',
        tituloEnRenglones: ['Televisión', 'Barata'],
        etiqueta: 'Programa',
        categoria: 'Programa',
        anio: '[Año]',
        lineaEnLaLista: 'Programa · Producción audiovisual',
        bajada: 'Un programa hecho entre amigos que, en lo audiovisual, se veía como uno de primera línea.',
        colores: { fondo: 'negro', puntos: 'hueso' },
        ficha: [
            { dato: 'Rol', valor: 'Producción audiovisual' },
            { dato: 'Formato', valor: 'Programa' },
            { dato: 'Preparación', valor: 'Un mes de preproducción audiovisual' },
            { dato: 'Año', valor: '[Completar]' },
        ],
        frase: 'Un programa casero con terminación de primera línea.',
        texto: [
            'Antes de salir, pasamos un mes preparando toda la parte audiovisual para que el programa se viera como uno de primera línea.',
            '[Qué hacía Santi en cada emisión]',
        ],
        galeria: {
            titulo: 'Clips y fotos',
            piezas: [
                { tipo: 'foto', titulo: 'Foto 1', comoSeHizo: '[Cómo se hizo esta toma]' },
                { tipo: 'video', titulo: 'Video 1' },
                { tipo: 'foto', titulo: 'Foto 2', comoSeHizo: '[Cómo se hizo esta toma]' },
                { tipo: 'video', titulo: 'Video 2' },
            ],
        },
        creditos: [
            { rol: 'Producción audiovisual', nombre: 'Santiago Pérez Mejías' },
            { rol: 'Equipo', nombre: '[Nombres]' },
        ],
    },

    // ============ SHOWS Y FESTIVALES ============
    {
        carpeta: 'shows-y-festivales',
        titulo: 'Shows y festivales',
        tituloEnRenglones: ['Shows y', 'festivales'],
        etiqueta: 'Eventos en vivo',
        categoria: 'Eventos en vivo',
        anio: '[Fechas]',
        lineaEnLaLista: 'Eventos en vivo · Asistencia de producción',
        bajada: 'Producción en vivo: estar al pie del cañón para que el show salga.',
        colores: { fondo: 'rojo', puntos: 'negro' },
        ficha: [
            { dato: 'Rol', valor: 'Asistencia y apoyo general de producción' },
            { dato: 'Formato', valor: 'Eventos musicales en vivo y festivales' },
            { dato: 'Festivales', valor: 'Lollapalooza Argentina · [otros]' },
            { dato: 'Años', valor: '[Completar]' },
        ],
        frase: 'Al pie del cañón para todo.',
        texto: [
            'Trabajé en shows y festivales, entre ellos Lollapalooza Argentina.',
            'Fui el enlace con los artistas: si necesitaban algo, se lo alcanzaba. Armé escenografía con el área de arte y, durante el show, tiré cables, afiné guitarras y estuve atrás de la consola de audio para que no pasara nada.',
        ],
        cinta: ['Artistas', 'Escenografía', 'Cables', 'Consola', 'En vivo'],
        queHice: {
            intro: 'De la escenografía al final del show.',
            tareas: [
                { momento: 'Antes', titulo: 'Escenografía', texto: 'Armar la escenografía junto al área de arte.' },
                { momento: 'Durante', titulo: 'Artistas', texto: 'Ser el enlace con los artistas y resolver lo que necesiten.' },
                { momento: 'Durante', titulo: 'Técnica', texto: 'Tirar cables, afinar guitarras y asistir atrás de la consola de audio.' },
            ],
        },
        galeria: {
            titulo: 'Clips y fotos',
            piezas: [
                { tipo: 'foto', titulo: 'Foto 1', comoSeHizo: '[Cómo se hizo esta toma]' },
                { tipo: 'video', titulo: 'Video 1' },
                { tipo: 'foto', titulo: 'Foto 2', comoSeHizo: '[Cómo se hizo esta toma]' },
                { tipo: 'video', titulo: 'Video 2' },
            ],
        },
        creditos: [{ rol: 'Asistencia de producción', nombre: 'Santiago Pérez Mejías' }],
    },
]