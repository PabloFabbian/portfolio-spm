import { Link } from 'react-router'
import { ArrowRight } from '../../components/icons'
import { links, site } from '../../data/site'

export function NextProject({ next, position, total }) {
  return (
    <footer className="mx-auto max-w-[1440px] px-4 pt-12 pb-6 lg:px-10 lg:pt-[72px] lg:pb-8">
      <Link
        to={`/proyectos/${next.slug}`}
        className="group flex items-end justify-between gap-3 border-b-[3px] border-ink px-2 pt-2 pb-5 transition-colors duration-150 hover:bg-ink hover:text-paper lg:gap-x-8 lg:px-3 lg:pt-3 lg:pb-7"
      >
        <span className="min-w-0">
          <span className="eyebrow mb-2.5 block lg:mb-3 lg:text-[13px]">
            Siguiente proyecto · {position} de {total}
          </span>
          <span className="display block leading-[.92] text-[length:clamp(44px,13vw,72px)] lg:text-[length:clamp(56px,10vw,150px)]">
            {next.title}
          </span>
        </span>
        <ArrowRight
          size={40}
          strokeWidth={2.5}
          className="shrink-0 transition-transform duration-200 group-hover:translate-x-2 lg:size-16"
        />
      </Link>

      <div className="eyebrow flex flex-col items-start pt-4 tracking-[.1em] lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6 lg:gap-y-3 lg:pt-7 lg:text-[13px]">
        <Link to="/#trabajos" className="-ml-2 px-2 py-3 transition-colors duration-150 hover:bg-ink hover:text-paper">
          Todos los trabajos
        </Link>
        <a
          href={links.email}
          className="-ml-2 px-2 py-3 normal-case transition-colors duration-150 hover:bg-ink hover:text-paper lg:uppercase"
        >
          {site.contact.email}
        </a>
        <span className="py-3">
          © {site.year} {site.name}
        </span>
      </div>
    </footer>
  )
}
