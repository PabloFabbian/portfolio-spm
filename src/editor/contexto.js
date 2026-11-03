// Adónde van los videos (lo dice /api/estado): a Cloudinary, hasta 100 MB, o a GitHub, hasta 4 MB
import { createContext, useContext } from 'react'
import { PESO_MAXIMO_DE_SUBIDA } from '../lib/contenido.js'

export const VIDEOS_EN_GITHUB = { servicio: 'github', pesoMaximo: PESO_MAXIMO_DE_SUBIDA }

export const ContextoDeVideos = createContext(VIDEOS_EN_GITHUB)

export const useVideos = () => useContext(ContextoDeVideos)

export const videosEnLaNube = (videos) => videos?.servicio === 'cloudinary'

/** Marcos donde se ve cada foto o video en la web (para mostrar cómo queda el encuadre) */
export const MARCOS = {
  portada: [
    { nombre: 'Celular', proporcion: '1 / 1' },
    { nombre: 'Compu', proporcion: '3 / 4' },
  ],
  sobreMi: [
    { nombre: 'Celular', proporcion: '1 / 1' },
    { nombre: 'Compu', proporcion: '4 / 5' },
  ],
  vertical: [{ nombre: 'En la web', proporcion: '4 / 5' }],
  principal: [
    { nombre: 'Celular', proporcion: '4 / 5' },
    { nombre: 'Tablet', proporcion: '16 / 9' },
    { nombre: 'Compu', proporcion: '21 / 9' },
  ],
}
