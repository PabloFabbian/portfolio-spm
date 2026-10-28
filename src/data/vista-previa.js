/*
 * Vista previa del editor (/editar).
 * El editor abre la web adentro de un recuadro con ?vista-previa en la dirección y le deja
 * el borrador en window.__SPM_VISTA_PREVIA__. Si la web se abre normal, esto es null y se
 * usa el contenido publicado.
 */
function leerBorrador() {
  try {
    if (!new URLSearchParams(window.location.search).has('vista-previa')) return null
    if (window.parent === window) return null
    const borrador = window.parent.__SPM_VISTA_PREVIA__
    return borrador && typeof borrador === 'object' ? borrador : null
  } catch {
    return null
  }
}

export const vistaPrevia = leerBorrador()

/** Fotos y videos del borrador que están dentro de una carpeta (mismo formato que import.meta.glob) */
export function archivosDeVistaPrevia(prefijo) {
  const archivos = vistaPrevia?.archivos ?? {}
  return Object.fromEntries(Object.entries(archivos).filter(([ruta]) => ruta.startsWith(prefijo)))
}
