// Foto o video de nombre fijo (portada-1, tarjeta, galeria-2...): ver, cambiar, quitar y encuadrar
import { useId, useState } from 'react'
import { Video } from '../components/Video'
import { prepararArchivo, pesoLegible, segundosLegibles } from './archivos'
import { Boton } from './campos'
import { useVideos, videosEnLaNube } from './contexto'
import { Encuadre } from './Encuadre'
import { BOTONES } from './estilos'

const IMAGENES = 'image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif'
const videosQueAcepta = (nube) => (nube ? 'video/mp4,video/webm,video/quicktime,.mp4,.m4v,.mov,.webm' : 'video/mp4,video/webm')
const ACEPTA = {
  imagen: () => IMAGENES,
  video: (nube) => videosQueAcepta(nube),
  ambos: (nube) => `${IMAGENES},${videosQueAcepta(nube)}`,
}

function estadoDe(archivo, acepta) {
  if (!archivo) return { video: 'Sin video', imagen: 'Sin foto', ambos: 'Sin archivo' }[acepta]
  if (archivo.origen === 'nuevo') {
    return `Nuevo · ${pesoLegible(archivo.peso)} · se sube ${archivo.destino === 'nube' ? 'a Cloudinary ' : ''}al publicar`
  }
  if (archivo.origen === 'nube') return 'En Cloudinary'
  return 'Publicado'
}

export function CampoArchivo({
  etiqueta,
  ayuda,
  archivo,
  onCambio,
  acepta = 'imagen',
  proporcion = 'aspect-[4/5]',
  ancho = 'w-28 lg:w-36',
  ladoMaximo,
  recorte,
  quitable = true,
  marcos = null,
  conInicio = false,
}) {
  const id = useId()
  const videos = useVideos()
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState(null)
  const [encuadrando, setEncuadrando] = useState(false)

  async function elegir(evento) {
    const elegido = evento.target.files?.[0]
    evento.target.value = ''
    if (!elegido) return
    setTrabajando(true)
    setError(null)
    try {
      const nuevo = await prepararArchivo(elegido, { acepta, ladoMaximo, recorte, videos })
      if (archivo?.origen === 'nuevo') URL.revokeObjectURL(archivo.url)
      onCambio(nuevo)
    } catch (problema) {
      setError(problema.message)
    } finally {
      setTrabajando(false)
    }
  }

  function quitar() {
    if (archivo?.origen === 'nuevo') URL.revokeObjectURL(archivo.url)
    setError(null)
    onCambio(null)
  }

  const esVideo = archivo?.kind === 'video'
  // El clip de Cloudinary ya viene recortado; los demás arrancan en "inicio" desde acá
  const arranque = archivo?.origen === 'nube' && !archivo.local ? 0 : (archivo?.inicio ?? 0)
  const ajustes = [
    archivo?.encuadre && 'encuadre ajustado',
    esVideo && archivo.inicio > 0 && `arranca en ${segundosLegibles(archivo.inicio)}`,
  ].filter(Boolean)
  const puedeEncuadrar = Boolean(archivo && marcos?.length)

  return (
    <div role="group" aria-label={etiqueta}>
      {etiqueta && (
        <div className="mb-2">
          <p className="eyebrow">{etiqueta}</p>
          {ayuda && <p className="mt-1 text-[13px] leading-[1.5] text-ink/70">{ayuda}</p>}
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={`relative shrink-0 overflow-hidden border-[3px] border-ink bg-ink ${proporcion} ${ancho}`}>
          {esVideo && (
            <Video
              src={archivo.url}
              poster={archivo.poster}
              position={archivo.encuadre}
              start={arranque}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {archivo?.kind === 'image' && (
            <img
              src={archivo.url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={archivo.encuadre ? { objectPosition: archivo.encuadre } : undefined}
            />
          )}
          {!archivo && (
            <span className="eyebrow absolute inset-0 flex items-center justify-center p-2 text-center text-[10px] text-paper/60">Falta</span>
          )}
          {trabajando && (
            <span className="eyebrow absolute inset-0 flex items-center justify-center bg-ink/80 p-2 text-center text-[10px] text-paper">
              Preparando…
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <p className={`text-[13px] leading-[1.45] ${archivo?.origen === 'nuevo' ? 'font-bold text-rec' : 'text-ink/70'}`}>
            {estadoDe(archivo, acepta)}
            {ajustes.length > 0 && <span className="block font-normal text-ink/60">{ajustes.join(' · ')}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              id={id}
              type="file"
              accept={ACEPTA[acepta](videosEnLaNube(videos))}
              className="peer sr-only"
              onChange={elegir}
              disabled={trabajando}
            />
            <label
              htmlFor={id}
              className={`${BOTONES.secundario} inline-flex cursor-pointer items-center peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rec`}
            >
              {archivo ? 'Cambiar' : 'Elegir'}
            </label>
            {puedeEncuadrar && (
              <Boton onClick={() => setEncuadrando(true)} disabled={trabajando}>
                {esVideo && conInicio ? 'Encuadre e inicio' : 'Encuadre'}
              </Boton>
            )}
            {archivo && quitable && (
              <Boton onClick={quitar} disabled={trabajando}>
                Quitar
              </Boton>
            )}
          </div>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 border-l-[3px] border-rec pl-2.5 text-[13px] font-bold leading-[1.5] text-rec">
          {error}
        </p>
      )}
      {encuadrando && archivo && (
        <Encuadre archivo={archivo} marcos={marcos} conInicio={conInicio} onCambio={onCambio} onCerrar={() => setEncuadrando(false)} />
      )}
    </div>
  )
}
