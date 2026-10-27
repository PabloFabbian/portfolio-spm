import { Link } from 'react-router'
import { site } from '../data/site'
import { ArrowLeft } from './icons'

const NAV = [
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'trabajos', label: 'Trabajos' },
  { id: 'contacto', label: 'Contacto' },
]

const hover = 'transition-colors duration-150 hover:bg-ink hover:text-paper'

/**
 * Encabezado. En la home usa anclas a cada sección; en un proyecto,
 * vuelve a la home y muestra en qué proyecto estás.
 */
export function Header({ variant = 'home', counter }) {
  const isHome = variant === 'home'

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-1 border-b-[3px] border-ink pt-1 pr-1 pl-2 md:px-10 md:py-3">
      {isHome ? (
        <a
          href="#inicio"
          aria-label={`${site.name}, inicio`}
          className={`display px-2 py-3 text-[22px] leading-none tracking-[.03em] md:p-2.5 md:text-[28px] ${hover}`}
        >
          {site.name}
        </a>
      ) : (
        <Link
          to="/"
          aria-label={`${site.name}, volver al inicio`}
          className={`display px-2 py-3 text-[22px] leading-none tracking-[.03em] md:p-2.5 md:text-[28px] ${hover}`}
        >
          {site.name}
        </Link>
      )}

      {isHome ? (
        <nav aria-label="Principal" className="flex flex-wrap text-xs font-bold tracking-[.08em] uppercase md:gap-x-5 md:text-sm">
          {NAV.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={`px-2 py-3.5 md:py-3 ${hover}`}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : (
        <Link
          to="/#trabajos"
          className={`flex min-h-11 items-center gap-1.5 px-2 py-2.5 text-xs font-bold tracking-[.08em] uppercase md:gap-2.5 md:px-3 md:text-sm ${hover}`}
        >
          <ArrowLeft size={18} className="md:size-[22px]" />
          <span className="md:hidden">Trabajos</span>
          <span className="hidden md:inline">Todos los trabajos</span>
        </Link>
      )}

      <div className="hidden items-center gap-2.5 text-[13px] font-bold tracking-[.08em] uppercase lg:flex">
        <span aria-hidden="true" className="inline-block size-3 border-2 border-ink bg-rec" />
        <span>{isHome ? `Portfolio ${site.year}` : counter}</span>
      </div>
    </header>
  )
}
