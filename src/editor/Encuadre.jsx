// Ventana para elegir el encuadre de una foto o un video y, en los videos, desde dónde arranca el clip
import { useEffect, useId, useRef, useState } from 'react'
import { DURACION_DEL_CLIP, ENCUADRE_CENTRADO, leerEncuadre } from '../lib/contenido.js'
import { segundosLegibles } from './archivos'
import { Boton } from './campos'
import { CLASE_DE_ENTRADA } from './estilos'

const coordenadas = (encuadre) => (leerEncuadre(encuadre) ?? ENCUADRE_CENTRADO).split(' ').map((n) => parseFloat(n))
const redondear = (n) => Math.round(n * 10) / 10

export function Encuadre({ archivo, marcos, conInicio = false, onCambio, onCerrar }) {
  const dialogo = useRef(null)
  const video = useRef(null)
  const idTitulo = useId()
  const idInicio = useId()
  const esVideo = archivo.kind === 'video'
  // Un video de Cloudinary ya publicado se ve recortado: acá no se puede recorrer entero
  const recortado = archivo.origen === 'nube' && !archivo.local
  const [x, y] = coordenadas(archivo.encuadre)
  const inicio = archivo.inicio ?? 0
  const [proporcion, setProporcion] = useState(null)
  const [duracion, setDuracion] = useState(archivo.duracion ?? archivo.nube?.duracion ?? null)
  const [cuadro, setCuadro] = useState(esVideo ? (archivo.poster ?? null) : archivo.url)
  const [mirando, setMirando] = useState(false)
  const [sinVista, setSinVista] = useState(Boolean(archivo.sinVista))
  const maximo = duracion ? Math.max(0, Math.floor((duracion - 1) * 10) / 10) : null

  useEffect(() => {
    const ventana = dialogo.current
    ventana?.showModal()
    return () => ventana?.close()
  }, [])

  function ponerEncuadre(nuevaX, nuevaY) {
    const limitar = (n) => Math.round(Math.min(100, Math.max(0, n)))
    const valor = `${limitar(nuevaX)}% ${limitar(nuevaY)}%`
    onCambio({ ...archivo, encuadre: valor === ENCUADRE_CENTRADO ? undefined : valor })
  }

  // El punto tocado, en % de la foto o el video (que ocupa el recuadro sin el borde)
  function tocar(evento) {
    const recuadro = evento.currentTarget
    const caja = recuadro.getBoundingClientRect()
    const x = (evento.clientX - caja.left - recuadro.clientLeft) / recuadro.clientWidth
    const y = (evento.clientY - caja.top - recuadro.clientTop) / recuadro.clientHeight
    ponerEncuadre(x * 100, y * 100)
  }

  function ponerInicio(valor) {
    const segundos = Number.isFinite(valor) ? redondear(Math.min(Math.max(valor, 0), maximo ?? 36000)) : 0
    onCambio({ ...archivo, inicio: segundos > 0 ? segundos : undefined })
    const elemento = video.current
    if (elemento && !recortado && elemento.readyState >= 1) {
      elemento.pause()
      setMirando(false)
      elemento.currentTime = segundos
    }
  }

  // Cuadro fijo del video, para mostrar cómo queda en cada recuadro
  function capturar() {
    const elemento = video.current
    if (!elemento?.videoWidth || recortado) return
    const escala = Math.min(1, 640 / Math.max(elemento.videoWidth, elemento.videoHeight))
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(elemento.videoWidth * escala)
    lienzo.height = Math.round(elemento.videoHeight * escala)
    try {
      lienzo.getContext('2d').drawImage(elemento, 0, 0, lienzo.width, lienzo.height)
      setCuadro(lienzo.toDataURL('image/jpeg', 0.8))
    } catch {
      // si el navegador no deja copiar el cuadro, los recuadros quedan sin imagen
    }
  }

  function ver() {
    const elemento = video.current
    if (!elemento) return
    if (mirando) {
      elemento.pause()
      setMirando(false)
      return
    }
    if (!recortado) elemento.currentTime = inicio
    elemento
      .play()
      .then(() => setMirando(true))
      .catch(() => setMirando(false))
  }

  const ancho = proporcion ? `min(100%, calc(46vh * ${proporcion}))` : '100%'
  const posicion = `${x}% ${y}%`

  return (
    <dialog
      ref={dialogo}
      onCancel={(evento) => {
        evento.preventDefault()
        onCerrar()
      }}
      aria-labelledby={idTitulo}
      className="m-auto w-[min(760px,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-y-auto border-[3px] border-ink bg-paper p-0 text-ink backdrop:bg-ink/70"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-ink px-5 py-4 text-paper">
        <h2 id={idTitulo} className="display text-[26px] leading-none tracking-[.03em]">
          {esVideo && conInicio ? 'Encuadre e inicio' : 'Encuadre'}
        </h2>
        <button type="button" onClick={onCerrar} className="eyebrow min-h-10 px-2 hover:text-rec" aria-label="Cerrar">
          ✕
        </button>
      </header>

      <div className="flex flex-col gap-5 px-5 py-5">
        {sinVista ? (
          <p className="border-l-[3px] border-rec pl-3 text-[14px] leading-[1.55]">
            Este navegador no puede mostrar este video (pasa con algunos .mov). Igual se puede publicar: Cloudinary lo convierte. Después de publicar,
            volvé a abrir esta ventana para elegir el encuadre.
          </p>
        ) : (
          <>
            <p className="text-[14px] leading-[1.55]">
              Tocá {esVideo ? 'el video' : 'la foto'} en lo más importante: esa parte queda siempre a la vista, aunque el recuadro de la web
              recorte los bordes.
            </p>

            <div
              className="relative mx-auto cursor-crosshair overflow-hidden border-[3px] border-ink bg-ink"
              style={{ aspectRatio: proporcion ?? (esVideo ? '16 / 9' : '4 / 3'), width: ancho }}
              onClick={tocar}
            >
              {esVideo ? (
                <video
                  ref={video}
                  src={archivo.url}
                  poster={archivo.poster ?? undefined}
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 h-full w-full object-cover"
                  onLoadedMetadata={(evento) => {
                    const elemento = evento.currentTarget
                    if (elemento.videoWidth) setProporcion(elemento.videoWidth / elemento.videoHeight)
                    if (!recortado && Number.isFinite(elemento.duration)) {
                      setDuracion((actual) => actual ?? elemento.duration)
                      if (inicio) elemento.currentTime = inicio
                    }
                  }}
                  onLoadedData={capturar}
                  onSeeked={capturar}
                  onTimeUpdate={(evento) => {
                    const elemento = evento.currentTarget
                    if (mirando && !recortado && elemento.currentTime >= inicio + DURACION_DEL_CLIP) {
                      elemento.pause()
                      elemento.currentTime = inicio
                      setMirando(false)
                    }
                  }}
                  onEnded={() => setMirando(false)}
                  onError={() => setSinVista(true)}
                />
              ) : (
                <img
                  src={archivo.url}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                  onLoad={(evento) => {
                    const imagen = evento.currentTarget
                    if (imagen.naturalWidth) setProporcion(imagen.naturalWidth / imagen.naturalHeight)
                  }}
                />
              )}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-paper shadow-[0_0_0_3px_#0b0b0b,inset_0_0_0_3px_#0b0b0b]"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="eyebrow">Horizontal · {x}%</span>
                <input type="range" min="0" max="100" step="1" value={x} onChange={(e) => ponerEncuadre(Number(e.target.value), y)} className="accent-rec" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="eyebrow">Vertical · {y}%</span>
                <input type="range" min="0" max="100" step="1" value={y} onChange={(e) => ponerEncuadre(x, Number(e.target.value))} className="accent-rec" />
              </label>
            </div>

            <div>
              <p className="eyebrow mb-2">Así se ve en la web</p>
              <div className="flex flex-wrap items-end gap-3">
                {marcos.map((marco) => (
                  <figure key={marco.nombre} className="m-0">
                    <div className="relative h-24 overflow-hidden border-[3px] border-ink bg-ink lg:h-28" style={{ aspectRatio: marco.proporcion }}>
                      {cuadro && <img src={cuadro} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: posicion }} />}
                    </div>
                    <figcaption className="eyebrow mt-1.5 text-[10px] text-ink/70">{marco.nombre}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </>
        )}

        {esVideo && conInicio && (
          <div className="flex flex-col gap-3 border-t-[3px] border-ink/20 pt-4">
            <p className="eyebrow">Desde dónde arranca</p>
            <p className="-mt-1 text-[13px] leading-[1.5] text-ink/75">
              La web muestra {DURACION_DEL_CLIP} segundos en loop y sin sonido. Elegí el segundo donde empiezan.
            </p>
            {recortado || sinVista || maximo === null ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={idInicio} className="text-[14px] font-bold">
                  Empieza en (segundos)
                </label>
                <input
                  id={idInicio}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={maximo ?? undefined}
                  step="0.5"
                  value={inicio}
                  onChange={(e) => ponerInicio(Number(e.target.value))}
                  className={`${CLASE_DE_ENTRADA} max-w-40`}
                />
                {recortado && (
                  <p className="text-[13px] leading-[1.5] text-ink/70">
                    Acá se ve el clip que está publicado (desde el segundo {segundosLegibles(archivo.recortadoDesde ?? 0)}). Si lo cambiás, el clip
                    nuevo se prepara al publicar y se ve en la web uno o dos minutos después.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label htmlFor={idInicio} className="text-[14px] font-bold">
                  Empieza en {segundosLegibles(inicio)} <span className="font-normal text-ink/60">de {segundosLegibles(duracion)}</span>
                </label>
                <input
                  id={idInicio}
                  type="range"
                  min="0"
                  max={maximo}
                  step="0.1"
                  value={Math.min(inicio, maximo)}
                  onChange={(e) => ponerInicio(Number(e.target.value))}
                  className="accent-rec"
                />
              </div>
            )}
            {!sinVista && (
              <Boton className="self-start" onClick={ver}>
                {mirando ? '■ Parar' : `▶ Ver los ${DURACION_DEL_CLIP} segundos`}
              </Boton>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t-[3px] border-ink pt-4">
          <Boton variante="principal" onClick={onCerrar}>
            Listo
          </Boton>
          {!sinVista && <Boton onClick={() => ponerEncuadre(50, 50)}>Centrar</Boton>}
        </div>
      </div>
    </dialog>
  )
}
