import { motion } from 'framer-motion'
import { EASE } from '../lib/tokens'

const variants = {
  hidden: (y) => ({ opacity: 0, y }),
  shown: { opacity: 1, y: 0 },
}

/**
 * Aparece con un leve desplazamiento cuando entra en pantalla (una sola vez).
 * `as` define la etiqueta: 'div', 'p', 'h2', 'dl'...
 */
export function Reveal({ as = 'div', delay = 0, y = 28, className, children, ...rest }) {
  const Tag = motion[as] ?? motion.div
  return (
    <Tag
      className={className}
      custom={y}
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
