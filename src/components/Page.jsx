import { motion } from 'framer-motion'
import { EASE } from '../lib/tokens'

// Envoltorio de cada página: fundido al entrar y al salir (transición entre rutas)
export function Page({ children }) {
  return (
    <motion.div
      className="overflow-x-clip"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
