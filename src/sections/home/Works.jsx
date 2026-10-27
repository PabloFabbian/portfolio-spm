import { useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Halftone } from '../../components/Halftone'
import { ArrowRight } from '../../components/icons'
import { Reveal } from '../../components/Reveal'
import { projects } from '../../data/projects'
import { COLOR, EASE } from '../../lib/tokens'

const projectUrl = (project) => `/proyectos/${project.slug}`

export function Works() {
  const [active, setActive] = useState(0)

  return (
    <section id="trabajos" className="mx-auto max-w-[1440px] pt-12 pb-14 lg:px-10 lg:pt-[72px] lg:pb-[88px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 px-4 lg:mb-10 lg:px-0">
        <Reveal
          as="h2"
          className="display text-[length:clamp(52px,16vw,80px)] leading-[.9] lg:text-[length:clamp(56px,9vw,128px)]"
        >
          <span className="mr-2.5 align-top font-mono text-sm font-bold tracking-[.08em] lg:mr-3.5 lg:text-base">(02)</span>
          Trabajos
        </Reveal>
        <p className="hidden max-w-[300px] text-sm lg:block">Elegí un proyecto para ver su clip.</p>
      </div>

      {/* Escritorio: lista + visor que cambia al pasar el cursor */}
      <Reveal className="hidden items-start gap-10 lg:flex">
        <ul className="min-w-0 flex-[1_1_440px] border-t-[3px] border-ink">
          {projects.map((project, i) => {
            const isActive = i === active
            return (
              <li key={project.slug}>
                <Link
                  to={projectUrl(project)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`flex w-full items-center gap-[18px] border-b-[3px] border-ink py-4 pr-4 transition-[background-color,color,padding] duration-200 ${isActive ? 'bg-ink pl-7 text-paper' : 'pl-4'
                    }`}
                >
                  <span className="flex min-w-0 flex-auto flex-col gap-1.5">
                    <span className="display text-[length:clamp(36px,4.6vw,64px)] leading-none">{project.title}</span>
                    <span className="text-xs tracking-[.08em] uppercase">{project.meta}</span>
                  </span>
                  <ArrowRight
                    size={28}
                    className={`shrink-0 text-rec transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        <Stage project={projects[active]} />
      </Reveal>

      {/* Celular y tablet: tarjetas que se deslizan de costado */}
      <div className="lg:hidden">
        <ul className="flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((project) => (
            <li key={project.slug} className="shrink-0 basis-[78%] snap-start md:basis-[44%]">
              <Link
                to={projectUrl(project)}
                aria-label={`Abrir ${project.title}`}
                className="relative block aspect-[4/5] overflow-hidden border-[3px] border-ink"
                style={{ backgroundColor: COLOR[project.tone.bg] }}
              >
                <Cover project={project} dotSize={Math.round(project.tone.size * 0.75)} />
                <span className="absolute top-3 right-3 left-3">
                  <span className="eyebrow inline-block border-2 border-ink bg-paper px-2.5 py-1.5 text-[11px] tracking-[.1em] text-ink">
                    {project.title}
                  </span>
                </span>
                <span className="display absolute right-0 bottom-0 flex items-center gap-2.5 bg-ink py-3 pr-4 pl-7 text-lg tracking-[.04em] text-paper cut-tab-sm">
                  Ver
                  <ArrowRight size={18} className="text-rec" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="eyebrow flex items-center gap-2.5 px-4 pt-2 tracking-[.1em]">
          <span>Deslizá</span>
          <ArrowRight size={20} />
        </p>
      </div>
    </section>
  )
}

function Stage({ project }) {
  return (
    <Link
      to={projectUrl(project)}
      aria-label={`Abrir ${project.title}`}
      className="group relative block aspect-[4/5] max-h-[780px] min-w-0 flex-[1_1_480px] overflow-hidden border-[3px] border-ink"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={project.slug}
          className="absolute inset-0"
          style={{ backgroundColor: COLOR[project.tone.bg] }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <Cover project={project} dotSize={project.tone.size} />
          {!project.media.cover && (
            <span className="eyebrow absolute top-4 left-4 border-2 border-ink bg-paper px-3 py-2 tracking-[.1em] text-ink">
              {project.media.coverLabel}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      <span className="display absolute right-0 bottom-0 z-10 flex items-center gap-3 bg-ink py-4 pr-6 pl-[38px] text-2xl tracking-[.04em] text-paper cut-tab">
        Ver proyecto
        <ArrowRight size={24} className="text-rec transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

/** Imagen de portada del proyecto o, si todavía no hay, la trama de puntos */
function Cover({ project, dotSize }) {
  if (project.media.cover) {
    return (
      <img
        src={project.media.cover}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
    )
  }
  return <Halftone dot={project.tone.dot} size={dotSize} />
}