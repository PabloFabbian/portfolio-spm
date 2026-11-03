/*
 * Videos guardados en Cloudinary: cómo se arman sus direcciones.
 *
 * Cloudinary guarda el video original (hasta 100 MB) y entrega una versión liviana armada
 * en la dirección misma: desde el segundo "inicio", 15 segundos, sin sonido, achicada y
 * comprimida. Lo usan la web (para mostrarlo), el editor y el servidor, que le pide a
 * Cloudinary que prepare esas versiones de antemano: tienen que ser exactamente las mismas.
 *
 * Este archivo no puede depender de Vite ni de React (también corre en el servidor).
 */
import { DURACION_DEL_CLIP } from './contenido.js'

// Lado mayor, en píxeles, de cada uso: el video principal se ve grande; el del carrusel, chico
export const LADO = { principal: 1600, galeria: 1280 }

// Carpeta y etiqueta con que quedan los videos en la Media Library de Cloudinary
export const CARPETA_EN_LA_NUBE = 'portfolio-web'
export const ETIQUETA_EN_LA_NUBE = 'portfolio-web'

// Segundos con un decimal, igual que se guardan en el contenido (12.5, 20, 0)
const decimas = (n) => Math.round((Number(n) || 0) * 10) / 10
const segundos = (n) => String(decimas(n))
const tamano = (uso) => {
  const lado = LADO[uso] ?? LADO.galeria
  return `c_limit,h_${lado},w_${lado}`
}

/*
 * El formato va escrito (f_mp4, f_jpg) aunque la dirección ya termine en .mp4 o .jpg: así
 * Cloudinary no le aplica ajustes automáticos de la cuenta y entrega exactamente lo que se
 * preparó de antemano (si la dirección difiere en algo, lo arma de nuevo en el momento, y
 * con los videos de más de 40 MB eso falla en el plan gratis).
 */

/** El clip: desde "inicio", 15 segundos, sin sonido, achicado y comprimido (MP4, H.264) */
export function transformacionDelClip(uso, inicio = 0) {
  const tramo = decimas(inicio) > 0 ? `du_${DURACION_DEL_CLIP},so_${segundos(inicio)}` : `du_${DURACION_DEL_CLIP}`
  return `${tramo}/${tamano(uso)}/ac_none,f_mp4,q_auto,vc_h264`
}

/** El cuadro fijo que se ve mientras carga el clip (el primero del clip) */
export const transformacionDelCuadro = (uso, inicio = 0) => `so_${segundos(inicio)}/${tamano(uso)}/f_jpg,q_auto`

/** Lo que se le pide a Cloudinary que prepare de antemano (parámetro "eager") */
export const transformacionesAnticipadas = (uso, inicio = 0) =>
  `${transformacionDelClip(uso, inicio)}/mp4|${transformacionDelCuadro(uso, inicio)}/jpg`

const base = (nube) => `https://res.cloudinary.com/${nube.cuenta}/video/upload`

export const urlDelClip = (nube, uso, inicio = 0) =>
  `${base(nube)}/${transformacionDelClip(uso, inicio)}/v${nube.version}/${nube.id}.mp4`

export const urlDelCuadro = (nube, uso, inicio = 0) =>
  `${base(nube)}/${transformacionDelCuadro(uso, inicio)}/v${nube.version}/${nube.id}.jpg`

/** Uso de cada lugar donde puede ir un video ("video-principal" o una pieza del carrusel) */
export const usoDe = (lugar) => (lugar === 'video-principal' ? 'principal' : 'galeria')
