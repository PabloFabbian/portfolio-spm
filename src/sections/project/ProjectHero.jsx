import { motion } from 'framer-motion'
import { EASE } from '../../lib/tokens'

// Los títulos con palabras largas ("producciones") usan un cuerpo más chico para no desbordar
const isLong = (lines) => Math.max(...lines.map((line) => line.length)) > 8

export function ProjectHero({ project }) {
  const long = isLong(project.titleLines)
  const size = long
    ? 'text-[length:clamp(44px,12.5vw,110px)] lg:text-[length:clamp(56px,9vw,150px)]'
    : 'text-[length:clamp(64px,20vw,110px)] lg:text-[length:clamp(64px,14vw,210px)]'

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-7 pb-8 lg:px-10 lg:pt-12 lg:pb-10">
      <motion.div
        className="eyebrow flex flex-wrap items-center gap-x-3.5 gap-y-2.5 lg:justify-between lg:gap-x-6 lg:text-[13px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <span className="inline-flex items-center gap-2.5 bg-ink px-3 py-2 text-paper lg:px-3.5">
          <span aria-hidden="true" className="rec-blink inline-block size-2.5 rounded-full bg-rec" />
          {project.kicker}
        </span>
        <span>
          {project.category} · {project.year}
        </span>
      </motion.div>

      <div className="mt-5 flex flex-col gap-5 lg:mt-6 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-x-14 lg:gap-y-6">
        <h1 className={`display knockout min-w-0 leading-[.9] tracking-[-.01em] lg:flex-[1_1_640px] ${size}`}>
          {project.titleLines.map((line, i) => (
            <motion.span
              key={line}
              className={`block ${i > 0 ? 'pl-[10vw] lg:pl-[max(0px,calc(10vw_-_40px))]' : ''}`}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.12 }}
            >
              {line}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="border-l-[3px] border-ink pl-3.5 text-[15px] leading-[1.6] lg:mb-3 lg:flex-[0_1_380px] lg:pl-5 lg:text-[17px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
        >
          {project.summary}
        </motion.p>
      </div>
    </section>
  )
}
