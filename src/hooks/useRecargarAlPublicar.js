import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { vistaPrevia } from '../data/vista-previa'

/**
 * Cuando el editor avisa que lo publicado ya está en la web, las pestañas abiertas de la
 * web se recargan solas para mostrar la versión nueva (el editor y la vista previa, no).
 */
export function useRecargarAlPublicar() {
  const { pathname } = useLocation()
  const esLaWeb = !pathname.startsWith('/editar') && !vistaPrevia

  useEffect(() => {
    if (!esLaWeb || typeof BroadcastChannel === 'undefined') return undefined
    const canal = new BroadcastChannel('spm-web')
    canal.onmessage = (evento) => {
      if (evento.data?.tipo === 'publicado') window.location.reload()
    }
    return () => canal.close()
  }, [esLaWeb])
}
