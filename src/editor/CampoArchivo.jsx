// Foto o video de nombre fijo (portada-1, tarjeta, galeria-2...): ver, cambiar o quitar
import { useId, useState } from 'react'
import { prepararArchivo, pesoLegible } from './archivos'
import { Boton } from './campos'
import { BOTONES } from './estilos'

const ACEPTA = {
  imagen: 'image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif',
  video: 'video/mp4,video/webm',
  ambos: 'image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif,video/mp4,video/webm',
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
}) {
  const id = useId()
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState(null)

  async function elegir(evento) {
    const elegido = evento.target.files?.[0]
    evento.target.value = ''
    if (!elegido) return
    setTrabajando(true)
    setError(null)
    try {
      const nuevo = await prepararArchivo(elegido, { acepta, ladoMaximo, recorte })
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

  const estado = !archivo
    ? { video: 'Sin video', imagen: 'Sin foto', ambos: 'Sin archivo' }[acepta]
    : archivo.origen === 'nuevo'
      ? `Nuevo · ${pesoLegible(archivo.peso)} · se sube al publicar`
      : 'Publicado'

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
          {archivo?.kind === 'video' && (
            <video src={archivo.url} muted loop playsInline autoPlay preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
          )}
          {archivo?.kind === 'image' && <img src={archivo.url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
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
          <p className={`text-[13px] leading-[1.45] ${archivo?.origen === 'nuevo' ? 'font-bold text-rec' : 'text-ink/70'}`}>{estado}</p>
          <div className="flex flex-wrap gap-2">
            <input id={id} type="file" accept={ACEPTA[acepta]} className="peer sr-only" onChange={elegir} disabled={trabajando} />
            <label
              htmlFor={id}
              className={`${BOTONES.secundario} inline-flex cursor-pointer items-center peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rec`}
            >
              {archivo ? 'Cambiar' : 'Elegir'}
            </label>
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
    </div>
  )
}
