import { useReducedMotion } from 'framer-motion'
import { Reveal } from '../../components/Reveal'
import { photos } from '../../data/site'

function Corner({ className }) {
  return <span aria-hidden="true" className={`absolute size-8 border-paper lg:size-14 ${className}`} />
}

/** Video (o imagen) principal del proyecto, enmarcado como el visor de una cámara */
export function ProjectMedia({ project }) {
  const reduce = useReducedMotion()
  const { clip, image, cover, clipLabel, shortClipLabel, timecode, specs } = project.media
  const fallback = photos.frente
  const hasMedia = Boolean(clip || image)

  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-8 lg:px-10 lg:pb-14">
      <Reveal className="relative aspect-[4/5] overflow-hidden bg-ink text-paper md:aspect-video lg:aspect-[21/9]">
        {clip && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={clip}
            poster={cover ?? undefined}
            muted
            loop
            playsInline
            autoPlay={!reduce}
            preload="metadata"
          />
        )}
        {!clip && image && (
          <img src={image} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
        )}
        {!hasMedia && fallback && (
          // Provisorio hasta que suban el video: la foto de la portada atenuada
          <img
            src={fallback.src}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[center_30%] opacity-55"
          />
        )}

        <Corner className="top-3.5 left-3.5 border-t-[3px] border-l-[3px] lg:top-6 lg:left-6" />
        <Corner className="top-6 right-6 hidden border-t-[3px] border-r-[3px] lg:block" />
        <Corner className="bottom-6 left-6 hidden border-b-[3px] border-l-[3px] lg:block" />
        <Corner className="right-3.5 bottom-3.5 border-r-[3px] border-b-[3px] lg:right-6 lg:bottom-6" />

        <span aria-hidden="true" className="eyebrow absolute top-5 right-5 flex items-center gap-2 tracking-[.14em] lg:top-11 lg:right-24 lg:gap-2.5 lg:text-sm">
          <span className="rec-blink inline-block size-3 rounded-full bg-rec lg:size-3.5" />
          REC
        </span>

        {!hasMedia && (
          <>
            <span className="eyebrow absolute bottom-[54px] left-5 bg-paper px-2.5 py-1.5 text-[11px] tracking-[.1em] text-ink lg:hidden">
              {shortClipLabel}
            </span>
            <span className="eyebrow absolute top-10 left-24 hidden bg-paper px-3 py-2 tracking-[.1em] text-ink lg:block">
              {clipLabel}
            </span>
          </>
        )}

        {timecode && (
          <span aria-hidden="true" className="eyebrow absolute bottom-6 left-5 tracking-[.1em] lg:bottom-[42px] lg:left-24 lg:text-sm">
            {timecode}
          </span>
        )}
        {specs && (
          <span aria-hidden="true" className="eyebrow absolute right-24 bottom-[42px] hidden tracking-[.1em] lg:block lg:text-sm">
            {specs}
          </span>
        )}
      </Reveal>
    </section>
  )
}