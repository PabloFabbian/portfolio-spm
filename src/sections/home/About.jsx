import { photos } from '../../assets/photos'
import { Reveal } from '../../components/Reveal'
import { site } from '../../data/site'

export function About() {
  const { about } = site
  const { perfil } = photos

  return (
    <section id="sobre-mi" className="mx-auto max-w-[1440px] px-4 py-14 lg:px-10 lg:py-24">
      <div className="flex flex-col gap-8 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-[72px] lg:gap-y-14">
        <Reveal className="relative min-w-0 pr-4 pb-4 lg:flex-[0_1_460px] lg:pr-6 lg:pb-6">
          <div aria-hidden="true" className="absolute top-4 right-0 bottom-0 left-4 bg-rec cut-shadow lg:top-6 lg:left-6" />
          <div className="relative aspect-square overflow-hidden bg-ink cut-portrait-sm lg:aspect-[4/5] lg:cut-portrait">
            <img
              src={perfil.src}
              srcSet={perfil.srcSet}
              sizes="(min-width: 1024px) 440px, 100vw"
              width={perfil.width}
              height={perfil.height}
              alt={perfil.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </Reveal>

        <div className="min-w-0 lg:flex-[1_1_480px]">
          <Reveal as="p" className="eyebrow mb-3 text-[13px] lg:mb-4 lg:text-sm">
            {about.eyebrow}
          </Reveal>
          <Reveal
            as="h2"
            className="display knockout mb-6 text-[length:clamp(44px,13vw,72px)] leading-[.92] lg:mb-8 lg:text-[length:clamp(52px,8vw,112px)]"
          >
            {about.title}
          </Reveal>

          <Reveal delay={0.05}>
            {about.paragraphs.map((text) => (
              <p key={text} className="mb-3.5 text-base leading-[1.6] last:mb-7 lg:mb-4 lg:max-w-[560px] lg:text-lg lg:last:mb-10">
                {text}
              </p>
            ))}
          </Reveal>

          <Reveal as="dl" delay={0.1} className="border-t-[3px] border-ink">
            {about.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-wrap gap-x-5 gap-y-0.5 border-b-[3px] border-ink py-3 lg:gap-x-6 lg:gap-y-1 lg:py-3.5"
              >
                <dt className="eyebrow basis-[120px] lg:basis-[140px]">{fact.label}</dt>
                <dd className="flex-[1_1_160px] lg:flex-[1_1_200px]">{fact.value}</dd>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
