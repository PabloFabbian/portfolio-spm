import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'

// Posición de scroll de cada entrada del historial (para volver atrás al mismo lugar)
const positions = new Map()

/**
 * Ubica el scroll cuando se monta una página:
 * - al volver con "atrás", donde estabas;
 * - si el link trae un #ancla (por ejemplo /#trabajos), en esa sección;
 * - si no, arriba de todo.
 * Los saltos a anclas dentro de la misma página los resuelve el navegador.
 */
export function usePageScroll() {
  const { key, hash } = useLocation()
  const navigationType = useNavigationType()
  const placed = useRef(false)

  useLayoutEffect(() => {
    if (placed.current) return
    placed.current = true

    const saved = positions.get(key)
    if (navigationType === 'POP' && saved != null) {
      window.scrollTo({ top: saved, behavior: 'instant' })
      return
    }

    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [key, hash, navigationType])

  // Se guarda en la limpieza de un layout effect: corre antes de que la página
  // siguiente mueva el scroll (una limpieza de useEffect llegaría tarde)
  useLayoutEffect(() => {
    return () => {
      positions.set(key, window.scrollY)
    }
  }, [key])
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
  }, [title])
}
