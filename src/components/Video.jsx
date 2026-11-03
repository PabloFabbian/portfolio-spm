import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { DURACION_DEL_CLIP } from '../lib/contenido'

/**
 * Video en loop y sin sonido que se reproduce solo mientras está en pantalla, y no se
 * descarga hasta que hace falta. Con "reducir movimiento" activado, queda quieto.
 * - position: el encuadre (qué punto queda a la vista cuando el recuadro lo recorta).
 * - start: desde qué segundo arranca el clip de 15 segundos, para los videos que no vienen
 *   ya recortados (los de Cloudinary sí vienen recortados y arrancan en 0).
 */
export function Video({ src, poster = null, position = null, start = 0, className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const video = ref.current
    if (!video || reduce) return undefined
    const reproducir = () => video.play().catch(() => {})
    if (typeof IntersectionObserver === 'undefined') {
      reproducir()
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) reproducir()
        else video.pause()
      },
      { threshold: 0.2 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reduce, src])

  useEffect(() => {
    const video = ref.current
    if (!video || !(start > 0)) return undefined
    const alCargar = () => {
      if (video.currentTime < start) video.currentTime = start
    }
    const alAvanzar = () => {
      if (video.currentTime >= start + DURACION_DEL_CLIP || video.currentTime < start - 0.5) video.currentTime = start
    }
    video.addEventListener('loadedmetadata', alCargar)
    video.addEventListener('timeupdate', alAvanzar)
    if (video.readyState >= 1) alCargar()
    return () => {
      video.removeEventListener('loadedmetadata', alCargar)
      video.removeEventListener('timeupdate', alAvanzar)
    }
  }, [start, src])

  return (
    <video
      ref={ref}
      className={className}
      style={position ? { objectPosition: position } : undefined}
      src={src}
      poster={poster ?? undefined}
      muted
      loop
      playsInline
      preload={poster ? 'none' : 'metadata'}
    />
  )
}
