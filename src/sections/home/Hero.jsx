import { motion, useReducedMotion } from 'framer-motion'
import { photos } from '../../assets/photos'
import { ArrowRight, Play } from '../../components/icons'
import { site } from '../../data/site'
import { EASE } from '../../lib/tokens'

// Sangrías escalonadas de cada línea del nombre (celular / escritorio)
const LINE_INDENT = ['', 'pl-[10vw] lg:pl-[clamp(0px,12vw,170px)]', 'pl-[20vw] lg:pl-[clamp(0px,24vw,340px)]']
const NAME_TYPE =
  // Interlineado .94: con menos, las tildes de PÉREZ y MEJÍAS se pegan a la línea de arriba
  'display text-[length:clamp(72px,21vw,120px)] leading-[.94] tracking-[-.01em] lg:text-[length:clamp(72px,17vw,250px)]'

function NameLines() {
  return site.nameLines.map((line, i) => (
    <motion.span
      key={line}
      className={`block ${LINE_INDENT[i]}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.12 }}
    >
      <span className="relative inline-block">
        {/* Copia en hueso con borde granulado detrás de cada línea: despega el nombre
            de la foto y recorta las tildes sobre la línea de arriba para que se lean */}
        <span aria-hidden="true" className="halo absolute top-0 left-0">
          {line}
        </span>
        <span className="relative">{line}</span>
      </span>
    </motion.span>
  ))
}

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative mx-auto max-w-[1440px] px-4 pt-7 pb-10 lg:min-h-[900px] lg:px-10 lg:pt-14 lg:pb-16"
    >
      <GrungeFilter />

      <div className="relative z-[2] lg:pt-6">
        <h1 className={NAME_TYPE}>
          <NameLines />
        </h1>
      </div>

      <HeroPhoto />

      <motion.div
        className="relative z-[3] -mt-4 flex flex-wrap items-center gap-x-7 gap-y-5 lg:mt-9"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
      >
        <span className="eyebrow bg-ink px-3.5 py-2.5 text-[13px] tracking-[.14em] text-paper lg:px-5 lg:py-3 lg:text-[length:clamp(14px,1.5vw,20px)]">
          {site.role}
        </span>
        <CallToAction className="hidden lg:inline-flex" />
      </motion.div>

      <motion.p
        className="display relative z-[3] mt-6 text-[28px] leading-[1.05] lg:mt-8 lg:max-w-[480px] lg:text-[34px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
      >
        “{site.quote}”
      </motion.p>

      <CallToAction className="mt-6 flex w-full justify-center lg:hidden" />
    </section>
  )
}

function CallToAction({ className = '' }) {
  return (
    <a
      href="#trabajos"
      className={`display group min-h-14 items-center gap-3 bg-rec px-6 text-2xl tracking-[.04em] transition-colors duration-150 cut-sm hover:bg-ink hover:text-paper lg:pr-7 lg:pl-[34px] lg:cut-md ${className}`}
    >
      Ver trabajos
      <ArrowRight size={22} className="transition-transform duration-200 group-hover:translate-x-1" />
    </a>
  )
}

/** Las dos fotos de Santi se alternan con un fundido lento */
function HeroPhoto() {
  const reduce = useReducedMotion()
  const { frente, perfil } = photos

  return (
    <motion.div
      className="relative z-[1] -mt-[30px] lg:absolute lg:top-14 lg:right-10 lg:mt-0 lg:h-[min(700px,calc(100%_-_112px))] lg:w-[min(42%,580px)]"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: EASE, delay: 0.25 }}
    >
      <div className="relative aspect-square overflow-hidden bg-ink cut-hero-sm lg:absolute lg:inset-0 lg:aspect-auto lg:cut-hero">
        <img
          src={frente.src}
          srcSet={frente.srcSet}
          sizes="(min-width: 1024px) 580px, 100vw"
          width={frente.width}
          height={frente.height}
          alt={frente.alt}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <motion.img
          src={perfil.src}
          srcSet={perfil.srcSet}
          sizes="(min-width: 1024px) 580px, 100vw"
          width={perfil.width}
          height={perfil.height}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 0 } : { opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 10, times: [0, 0.42, 0.5, 0.92, 1], ease: 'easeInOut', repeat: Infinity }}
        />
      </div>

      <motion.div
        className="absolute top-12 -right-0.5 lg:top-auto lg:right-auto lg:bottom-[72px] lg:-left-7"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 1 }}
      >
        <a
          href="#trabajos"
          className="display flex min-h-11 rotate-6 items-center gap-2 border-[3px] border-ink bg-paper px-4 py-2 text-[22px] tracking-[.06em] transition-colors duration-150 hover:bg-ink hover:text-paper lg:-rotate-[7deg] lg:gap-2.5 lg:px-5 lg:py-2.5 lg:text-[26px]"
        >
          <Play size={14} className="lg:size-[18px]" />
          Reel
        </a>
      </motion.div>
    </motion.div>
  )
}

/** Filtro SVG del borde granulado (lo usa la clase .halo de index.css) */
function GrungeFilter() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute size-0 overflow-hidden">
      <defs>
        {/* Región amplia en alto: las tildes de Anton sobresalen bastante de la línea */}
        <filter id="spm-grunge" x="-5%" y="-45%" width="110%" height="190%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="7"
            xChannelSelector="R"
            yChannelSelector="G"
            result="rough"
          />
          <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="7" result="grain" />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -3.6"
            result="pores"
          />
          <feComposite in="rough" in2="pores" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}
