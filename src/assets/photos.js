import perfil720 from './santi-perfil-720.webp'
import perfil1200 from './santi-perfil-1200.webp'
import frente720 from './santi-frente-720.webp'
import frente1200 from './santi-frente-1200.webp'

// Retratos de Santi. Para cambiarlos, reemplazá los archivos manteniendo los nombres.
export const photos = {
  perfil: {
    src: perfil1200,
    srcSet: `${perfil720} 720w, ${perfil1200} 1200w`,
    width: 1200,
    height: 1200,
    alt: 'Santiago Pérez Mejías de perfil, iluminado en rojo',
  },
  frente: {
    src: frente1200,
    srcSet: `${frente720} 720w, ${frente1200} 1200w`,
    width: 1200,
    height: 1200,
    alt: 'Santiago Pérez Mejías de frente, a contraluz rojo',
  },
}
