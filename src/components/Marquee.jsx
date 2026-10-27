import { Fragment } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Cinta negra con palabras que pasan en bucle.
 * Repite la lista dos veces y la desplaza un 50% para que el loop no se note.
 */
export function Marquee({
  items,
  separator = '/',
  wordClassName = 'text-rec',
  separatorClassName = 'text-paper',
  className = '',
  duration = 32,
}) {
  const reduce = useReducedMotion()
  const row = [...items, ...items]

  return (
    <div aria-hidden="true" className={`overflow-hidden bg-ink ${className}`}>
      <motion.div
        className="display flex w-max py-3 text-[32px] leading-[1.1] tracking-[.02em] whitespace-nowrap md:text-[34px] lg:py-3.5 lg:text-[44px]"
        animate={reduce ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {row.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span className={wordClassName}>{word}</span>
            <span className={`px-5 lg:px-7 ${separatorClassName}`}>{separator}</span>
          </Fragment>
        ))}
      </motion.div>
    </div>
  )
}
