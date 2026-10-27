/*
 * Fotos y videos por nombre de archivo.
 * Santi sube archivos con nombres fijos (portada-1.jpg, afiche.jpg, galeria-2.mp4...)
 * y acá se agrupan por carpeta, sin importar mayúsculas ni extensión.
 */

const VIDEO_EXTENSIONS = ['mp4', 'webm']

// Si hay dos archivos con el mismo nombre y distinta extensión, gana el primero de esta lista
// (el .webp va al final: es el formato de los archivos originales del proyecto)
const PRIORITY = ['jpg', 'jpeg', 'png', 'avif', 'gif', 'webp', 'mp4', 'webm']

export function slugify(text) {
    return String(text ?? '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/**
 * Recibe el resultado de import.meta.glob ({ ruta: url }) y devuelve
 * { carpeta: { nombre: { url, kind: 'image' | 'video', ext } } }
 */
export function groupByFolder(files) {
    const folders = {}
    for (const [path, url] of Object.entries(files)) {
        const parts = path.split('/')
        const file = parts.pop()
        const folder = slugify(parts.pop())
        const dot = file.lastIndexOf('.')
        const name = file.slice(0, dot).toLowerCase().trim()
        const ext = file.slice(dot + 1).toLowerCase()
        const entry = { url, ext, kind: VIDEO_EXTENSIONS.includes(ext) ? 'video' : 'image' }

        const bucket = (folders[folder] ??= {})
        const current = bucket[name]
        if (!current || PRIORITY.indexOf(ext) < PRIORITY.indexOf(current.ext)) bucket[name] = entry
    }
    return folders
}