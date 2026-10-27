import { COLOR } from '../lib/tokens'

/**
 * Trama de semitono (puntos) que se desvanece hacia abajo.
 * Es el relleno de los espacios donde todavía no hay foto o video.
 */
export function Halftone({ dot = 'ink', size = 14, fade = 75, className = '' }) {
  const mask = `linear-gradient(180deg, #000 5%, transparent ${fade}%)`
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at center, ${COLOR[dot] ?? dot} 31%, transparent 33%)`,
        backgroundSize: `${size}px ${size}px`,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  )
}
