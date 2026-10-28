import { Halftone } from '../../components/Halftone'
import { Reveal } from '../../components/Reveal'

/** Ficha técnica: 2 columnas en celular, 4 en escritorio */
export function ProjectFacts({ facts }) {
  if (!facts?.length) return null

  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-12 lg:px-10 lg:pb-20">
      <Reveal as="dl" className="grid grid-cols-2 gap-[3px] border-[3px] border-ink bg-ink lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="bg-paper px-3 pt-3.5 pb-4 lg:px-5 lg:pt-5 lg:pb-6">
            <dt className="eyebrow mb-1.5 text-[11px] lg:mb-2 lg:text-xs">{fact.label}</dt>
            <dd className="text-sm leading-[1.45] lg:text-[17px] lg:leading-normal">{fact.value}</dd>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

/** Afiche + texto del proyecto */
export function ProjectAbout({ project }) {
  const long = Math.max(...project.titleLines.map((line) => line.length)) > 8
  const posterTitle = long ? 'text-[44px] lg:text-[52px]' : 'text-[56px] lg:text-[72px]'
  const { poster, posterLabel = '[Afiche]' } = project.media

  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-14 lg:px-10 lg:pb-24">
      <div className="flex flex-col gap-8 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-[72px] lg:gap-y-12">
        <Reveal className="relative min-w-0 pr-3 pb-3 lg:flex-[0_1_440px] lg:pr-5 lg:pb-5">
          <div aria-hidden="true" className="absolute top-3 right-0 bottom-0 left-3 bg-ink lg:top-5 lg:left-5" />
          <div className="relative aspect-[4/5] overflow-hidden border-[3px] border-ink bg-rec">
            {poster ? (
              <img src={poster} alt={`Afiche de ${project.title}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <>
                <Halftone dot="ink" size={12} />
                <span className={`display absolute right-[18px] bottom-[18px] left-[18px] leading-[.86] lg:right-6 lg:bottom-6 lg:left-6 ${posterTitle}`}>
                  {project.titleLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
                <span className="eyebrow absolute top-3 left-3 border-2 border-ink bg-paper px-2.5 py-1.5 text-[11px] tracking-[.1em] lg:top-4 lg:left-4 lg:px-3 lg:py-2 lg:text-xs">
                  {posterLabel}
                </span>
              </>
            )}
          </div>
        </Reveal>

        <div className="min-w-0 lg:flex-[1_1_480px]">
          <p className="eyebrow mb-3.5 lg:mb-5 lg:text-[13px]">(Sobre el proyecto)</p>
          <Reveal
            as="p"
            className="display knockout mb-5 text-[length:clamp(30px,8.4vw,44px)] leading-[1.02] lg:mb-9 lg:text-[length:clamp(36px,5vw,72px)]"
          >
            {project.headline}
          </Reveal>
          <Reveal delay={0.05}>
            {project.body.map((text) => (
              <p key={text} className="mb-3.5 text-[15px] leading-[1.6] last:mb-0 lg:mb-[18px] lg:max-w-[580px] lg:text-[17px] lg:leading-[1.65]">
                {text}
              </p>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** "Lo que hice": tareas del proyecto */
export function ProjectTasks({ tasks, intro }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-14 lg:px-10 lg:pb-24">
      <div className="mb-5 lg:mb-8 lg:flex lg:flex-wrap lg:items-end lg:justify-between lg:gap-x-8 lg:gap-y-4">
        <Reveal
          as="h2"
          className="display mb-2.5 text-[length:clamp(44px,13vw,64px)] leading-[.9] lg:mb-0 lg:text-[length:clamp(44px,5.6vw,80px)]"
        >
          Lo que hice
        </Reveal>
        {intro && <p className="text-[13px] lg:max-w-[360px] lg:text-sm">{intro}</p>}
      </div>
      <Reveal className="grid gap-[3px] border-[3px] border-ink bg-ink lg:grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))]">
        {tasks.map((task) => (
          <div key={task.title} className="bg-paper px-4 pt-[18px] pb-5 lg:px-6 lg:pt-7 lg:pb-8">
            <p className="eyebrow mb-2.5 flex items-center gap-2.5 text-[11px] lg:mb-[18px] lg:text-xs">
              <span aria-hidden="true" className="inline-block size-2.5 bg-rec" />
              {task.tag}
            </p>
            <h3 className="display mb-2 text-[32px] leading-none lg:mb-3 lg:text-[40px]">{task.title}</h3>
            <p className="text-sm leading-[1.6] lg:text-[15px]">{task.text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

/** Créditos sobre fondo negro */
export function ProjectCredits({ credits }) {
  return (
    <section className="border-t-[3px] border-ink bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-4 py-14 lg:flex lg:flex-wrap lg:items-start lg:gap-x-[72px] lg:gap-y-10 lg:px-10 lg:py-[88px]">
        <Reveal
          as="h2"
          className="display mb-6 text-[length:clamp(48px,14vw,72px)] leading-[.88] lg:mb-0 lg:flex-[0_1_420px] lg:text-[length:clamp(56px,8vw,120px)]"
        >
          Créditos
        </Reveal>
        <dl className="min-w-0 border-t-[3px] border-paper lg:flex-[1_1_520px]">
          {credits.map((credit) => (
            <div
              key={`${credit.role}-${credit.name}`}
              className="border-b-[3px] border-paper py-3.5 lg:flex lg:flex-wrap lg:items-center lg:gap-x-6 lg:gap-y-1 lg:py-[18px]"
            >
              <dt className="eyebrow mb-1 flex items-center gap-2 text-[11px] lg:mb-0 lg:basis-[220px] lg:gap-2.5 lg:text-xs">
                <span aria-hidden="true" className="inline-block size-2 bg-rec lg:size-2.5" />
                {credit.role}
              </dt>
              <dd className="display text-2xl leading-[1.1] lg:flex-[1_1_240px] lg:text-[30px]">{credit.name}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
