import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useReducedMotion } from 'framer-motion'
import { COLOR, EASE } from '../lib/tokens'
import { Halftone } from './Halftone'
import { ArrowLeft, ArrowRight, Pause, Play } from './icons'

const AUTOPLAY_MS = 4000
const COPIES = [0, 1, 2] // la lista se dibuja 3 veces para que el bucle no tenga cortes

/**
 * Carrusel de clips y fotos de un proyecto.
 * - Escritorio: 3 a la vez. Tablet: 2. Celular: 1 y se asoma el siguiente.
 * - Avanza solo cada 4 s, en bucle. Se frena con el cursor encima, al enfocarlo,
 *   fuera de pantalla, con el botón de pausa o si el sistema pide menos movimiento.
 * - Se puede arrastrar con el dedo o el mouse y usar las flechas del teclado.
 */
export function MediaCarousel({ items, title, eyebrow = '(Clips y fotos)' }) {
  const n = items.length
  const reduce = useReducedMotion()
  const regionRef = useRef(null)
  const trackRef = useRef(null)
  const x = useMotionValue(0)
  const pos = useRef(n) // índice dentro de la pista; la copia del medio es la "real"
  const playback = useRef(null)
  const holding = useRef(false)
  const dragging = useRef(false)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const inView = useInView(regionRef, { amount: 0.35 })

  // Ancho de un paso: una pieza más el espacio entre piezas
  const getStep = useCallback(() => {
    const track = trackRef.current
    const first = track?.firstElementChild
    if (!track || !first) return 0
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0
    return first.getBoundingClientRect().width + gap
  }, [])

  // Si la pista se fue a una copia de los costados, vuelve a la del medio sin que se note
  const settle = useCallback(
    (step) => {
      let p = pos.current
      if (p >= 2 * n) {
        p -= n
        x.set(x.get() + n * step)
      } else if (p < n) {
        p += n
        x.set(x.get() - n * step)
      }
      pos.current = p
    },
    [n, x],
  )

  const go = useCallback(
    (delta) => {
      const step = getStep()
      if (!step) return
      playback.current?.stop()
      settle(step)
      const target = pos.current + delta
      pos.current = target
      setActive(((target % n) + n) % n)
      if (reduce) {
        x.set(-target * step)
        settle(step)
        return
      }
      playback.current = animate(x, -target * step, {
        duration: 0.65,
        ease: EASE,
        onComplete: () => settle(step),
      })
    },
    [getStep, n, reduce, settle, x],
  )

  // Posición inicial y reacomodo cuando cambia el ancho de la pantalla
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    const place = () => {
      const step = getStep()
      if (!step) return
      playback.current?.stop()
      x.set(-pos.current * step)
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(track)
    return () => observer.disconnect()
  }, [getStep, x])

  // Avance automático
  useEffect(() => {
    if (reduce || paused || !inView) return undefined
    const id = window.setInterval(() => {
      if (!holding.current && !dragging.current && document.visibilityState === 'visible') go(1)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [go, inView, paused, reduce])

  useEffect(() => {
    const current = playback
    return () => current.current?.stop()
  }, [])

  const onDragEnd = (_, info) => {
    dragging.current = false
    const step = getStep()
    if (!step) return
    const { offset, velocity } = info
    const far = Math.abs(offset.x) > step * 0.2
    const fast = Math.abs(velocity.x) > 500
    if (far || fast) {
      const direction = -Math.sign(far ? offset.x : velocity.x)
      const amount = Math.min(2, Math.max(1, Math.round(Math.abs(offset.x) / step)))
      go(direction * amount)
    } else {
      playback.current = animate(x, -pos.current * step, { duration: 0.4, ease: EASE })
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    }
  }

  return (
    <section aria-labelledby="carrusel-titulo" className="mx-auto max-w-[1440px] px-4 pb-14 lg:px-10 lg:pb-24">
      <div className="mb-4 lg:mb-7 lg:flex lg:flex-wrap lg:items-end lg:justify-between lg:gap-x-8 lg:gap-y-5">
        <div>
          <p className="eyebrow mb-4 lg:mb-5 lg:text-[13px]">{eyebrow}</p>
          <h2
            id="carrusel-titulo"
            className="display knockout text-[length:clamp(44px,13vw,64px)] leading-[.92] lg:text-[length:clamp(44px,5.6vw,80px)]"
          >
            {title}
          </h2>
        </div>

        <div className="mt-[18px] flex items-center justify-between gap-3 lg:mt-0 lg:justify-end">
          <div className="flex items-center gap-2.5 lg:gap-3">
            <div aria-hidden="true" className="flex gap-[5px] lg:gap-1.5">
              {items.map((item, i) => (
                <span
                  key={item.title}
                  className={`block h-2 w-[18px] border-2 border-ink transition-colors duration-300 lg:w-7 ${i === active ? 'bg-ink' : ''}`}
                />
              ))}
            </div>
            <span className="eyebrow min-w-[52px] tracking-[.1em] lg:text-sm">
              {active + 1} / {n}
            </span>
          </div>

          <div className="flex gap-2 lg:gap-3">
            {!reduce && (
              <ControlButton
                label={paused ? 'Reanudar el carrusel' : 'Pausar el carrusel'}
                onClick={() => setPaused((value) => !value)}
              >
                {paused ? <Play size={18} className="lg:size-5" /> : <Pause size={18} className="lg:size-5" />}
              </ControlButton>
            )}
            <ControlButton label="Anterior" onClick={() => go(-1)}>
              <ArrowLeft size={20} className="lg:size-6" />
            </ControlButton>
            <ControlButton label="Siguiente" onClick={() => go(1)} solid>
              <ArrowRight size={20} className="lg:size-6" />
            </ControlButton>
          </div>
        </div>
      </div>

      <div
        ref={regionRef}
        role="region"
        aria-roledescription="carrusel"
        aria-label={title}
        tabIndex={0}
        className="overflow-hidden"
        onKeyDown={onKeyDown}
        onMouseEnter={() => {
          holding.current = true
        }}
        onMouseLeave={() => {
          holding.current = false
        }}
        onFocus={() => {
          holding.current = true
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) holding.current = false
        }}
      >
        <motion.div
          ref={trackRef}
          className="flex cursor-grab touch-pan-y gap-3 select-none active:cursor-grabbing md:gap-6"
          style={{ x }}
          drag="x"
          dragMomentum={false}
          dragElastic={0}
          onDragStart={() => {
            dragging.current = true
            playback.current?.stop()
          }}
          onDragEnd={onDragEnd}
        >
          {COPIES.flatMap((copy) =>
            items.map((item, i) => {
              const isReal = copy === 1
              return (
                <div
                  key={`${copy}-${item.title}`}
                  className="min-w-0 shrink-0 basis-[82%] md:basis-[calc((100%_-_24px)/2)] lg:basis-[calc((100%_-_48px)/3)]"
                  role={isReal ? 'group' : undefined}
                  aria-roledescription={isReal ? 'diapositiva' : undefined}
                  aria-label={isReal ? `${i + 1} de ${n}: ${item.title}` : undefined}
                  aria-hidden={isReal ? undefined : true}
                  inert={isReal ? undefined : true}
                >
                  {item.type === 'clip' ? <ClipCard item={item} /> : <PhotoCard item={item} />}
                </div>
              )
            }),
          )}
        </motion.div>
      </div>
    </section>
  )
}

function ControlButton({ label, onClick, solid = false, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex size-12 cursor-pointer items-center justify-center border-[3px] border-ink transition-colors duration-150 lg:size-14 ${
        solid ? 'bg-ink text-paper hover:bg-rec hover:text-ink' : 'hover:bg-ink hover:text-paper'
      }`}
    >
      {children}
    </button>
  )
}

function Corner({ className }) {
  return <span aria-hidden="true" className={`absolute size-[26px] border-paper lg:size-8 ${className}`} />
}

function ClipCard({ item }) {
  const reduce = useReducedMotion()
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-ink text-paper">
      {item.src ? (
        <>
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={item.src}
            poster={item.poster ?? undefined}
            muted
            loop
            playsInline
            autoPlay={!reduce}
            preload="metadata"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        </>
      ) : (
        <Halftone dot={item.tone?.dot ?? 'rec'} size={13} fade={60} />
      )}
      <Corner className="top-3 left-3 border-t-[3px] border-l-[3px] lg:top-4 lg:left-4" />
      <Corner className="right-3 bottom-3 border-r-[3px] border-b-[3px] lg:right-4 lg:bottom-4" />
      <span aria-hidden="true" className="eyebrow absolute top-4 right-4 flex items-center gap-1.5 text-[11px] lg:top-[22px] lg:right-[22px] lg:gap-2 lg:text-xs">
        <span className="rec-blink inline-block size-[9px] rounded-full bg-rec lg:size-2.5" />
        REC
      </span>
      <div className="absolute inset-x-[18px] bottom-10 lg:inset-x-6 lg:bottom-12">
        {!item.src && <p className="eyebrow mb-1.5 text-[11px] lg:mb-2 lg:text-xs">{item.label}</p>}
        <p className="display text-[38px] leading-[.9] lg:text-5xl">{item.title}</p>
        {item.timecode && (
          <p aria-hidden="true" className="eyebrow mt-2 text-[11px] tracking-[.1em] lg:mt-2.5 lg:text-xs">
            {item.timecode}
          </p>
        )}
      </div>
    </div>
  )
}

function PhotoCard({ item }) {
  const bg = item.tone?.bg ?? 'paper'
  // En pantallas táctiles no hay "pasar el cursor": tocar la foto muestra cómo se hizo
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((value) => !value)

  return (
    <figure
      tabIndex={item.caption ? 0 : undefined}
      onClick={item.caption ? toggle : undefined}
      onKeyDown={(event) => {
        if (item.caption && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          toggle()
        }
      }}
      className="group relative m-0 aspect-[4/5] overflow-hidden border-[3px] border-ink text-ink"
      style={{ backgroundColor: COLOR[bg] }}
    >
      {item.src ? (
        <img
          src={item.src}
          alt={item.alt ?? item.title}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <Halftone dot={item.tone?.dot ?? 'ink'} size={12} fade={70} />
          <span className="eyebrow absolute top-2.5 left-2.5 border-2 border-ink bg-paper px-2 py-1 text-[11px] tracking-[.1em] lg:top-3.5 lg:left-3.5 lg:px-2.5 lg:py-1.5 lg:text-xs">
            {item.label}
          </span>
        </>
      )}

      {item.src ? (
        <p className="display absolute bottom-4 left-4 bg-ink px-3 py-1 text-[26px] leading-none text-paper lg:text-3xl">{item.title}</p>
      ) : (
        <p className="display absolute inset-x-[18px] bottom-5 text-[38px] leading-[.9] lg:inset-x-6 lg:bottom-7 lg:text-5xl">{item.title}</p>
      )}

      {item.caption && (
        <figcaption
          className={`absolute inset-x-0 bottom-0 bg-ink px-4 py-3.5 text-[13px] leading-[1.5] text-paper transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 lg:px-5 lg:py-[18px] lg:text-sm ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {item.caption}
        </figcaption>
      )}
    </figure>
  )
}
