// Ventana de Publicar: muestra qué cambia, pide la clave, sube los archivos y guarda
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ErrorDelEditor, commitEnLaWeb, entrar, firmarVideo, prepararVideo, publicar, subir } from './api'
import { pesoLegible } from './archivos'
import { Boton, Texto } from './campos'
import { archivoEnLaNube, armarPublicacion, claveDeClip, clipsDe, contenidoParaGuardar, reemplazarArchivo } from './estado'
import { subirALaNube } from './nube'

// Clips que ya se le pidieron a Cloudinary en esta sesión (para no pedirlos dos veces si hay que reintentar)
const clipsPedidos = new Set()

/** Avisa a las pestañas abiertas de la web que hay una versión nueva (se recargan solas) */
function avisarALaWeb(commit) {
  try {
    const canal = new BroadcastChannel('spm-web')
    canal.postMessage({ tipo: 'publicado', commit })
    canal.close()
  } catch {
    // navegador sin BroadcastChannel: hay que recargar a mano
  }
}

export function Publicar({ estado, inicial, publicados, cambios, obtenerBase, onCerrar, onPublicado, onVideoSubido }) {
  const dialogo = useRef(null)
  const idClave = useId()
  const [clave, setClave] = useState('')
  const [fase, setFase] = useState('pidiendo') // pidiendo · trabajando · listo · error
  const [paso, setPaso] = useState('')
  const [error, setError] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [enLaWeb, setEnLaWeb] = useState(null) // null · 'si' · 'tarda' · 'no-se-sabe'
  const [avisos, setAvisos] = useState([])
  const [conVideos, setConVideos] = useState(false)

  // Para mostrar antes de pedir la clave si falta corregir algo
  const errores = useMemo(() => armarPublicacion(estado, inicial, publicados).errores, [estado, inicial, publicados])

  useEffect(() => {
    const ventana = dialogo.current
    ventana?.showModal()
    return () => ventana?.close()
  }, [])

  // Después de publicar, avisa cuando Vercel terminó y el cambio ya se ve en la web
  useEffect(() => {
    if (fase !== 'listo' || !resultado?.commit || resultado.sinCambios) return undefined
    let vivo = true
    let intentos = 0
    let temporizador
    async function revisar() {
      const commit = await commitEnLaWeb()
      if (!vivo) return
      if (commit === null) return setEnLaWeb('no-se-sabe')
      if (commit === resultado.commit) {
        avisarALaWeb(commit)
        return setEnLaWeb('si')
      }
      intentos += 1
      if (intentos >= 60) return setEnLaWeb('tarda')
      temporizador = setTimeout(revisar, 5000)
    }
    temporizador = setTimeout(revisar, 4000)
    return () => {
      vivo = false
      clearTimeout(temporizador)
    }
  }, [fase, resultado])

  async function confirmar(evento) {
    evento.preventDefault()
    if (!clave.trim()) return
    setFase('trabajando')
    setError(null)
    setAvisos([])
    try {
      setPaso('Revisando la clave…')
      const { pase } = await entrar(clave)

      // 1. Los videos nuevos van directo del navegador a Cloudinary. Apenas sube cada uno,
      //    el editor lo anota: si algo falla después, al reintentar no se vuelve a subir.
      let trabajo = estado
      for (const clip of clipsDe(contenidoParaGuardar(inicial).proyectos.datos)) clipsPedidos.add(claveDeClip(clip))
      const paraLaNube = armarPublicacion(trabajo, inicial, publicados).nube
      for (const [i, { archivo, uso }] of paraLaNube.entries()) {
        const cual = paraLaNube.length > 1 ? ` ${i + 1} de ${paraLaNube.length}` : ''
        const inicio = archivo.inicio ?? 0
        setPaso(`Subiendo el video${cual} a Cloudinary…`)
        const firma = await firmarVideo(pase, { uso, inicio })
        if (archivo.peso > firma.pesoMaximo) {
          throw new ErrorDelEditor(`Un video pesa ${pesoLegible(archivo.peso)} y Cloudinary acepta hasta ${pesoLegible(firma.pesoMaximo)}.`)
        }
        const subido = await subirALaNube(firma, archivo.blob, (fraccion) =>
          setPaso(`Subiendo el video${cual} a Cloudinary: ${Math.floor(fraccion * 100)}%`),
        )
        const nube = {
          cuenta: firma.cuenta,
          id: subido.public_id,
          version: subido.version,
          ancho: subido.width,
          alto: subido.height,
          duracion: subido.duration,
        }
        const enLaNube = archivoEnLaNube(nube, uso, archivo, archivo.url)
        trabajo = reemplazarArchivo(trabajo, archivo, enLaNube)
        onVideoSubido(archivo, enLaNube)
        clipsPedidos.add(claveDeClip({ nube, uso, inicio }))
      }

      const publicacion = armarPublicacion(trabajo, inicial, publicados)
      if (publicacion.errores.length) throw new ErrorDelEditor('Hay datos para corregir antes de publicar.', { errores: publicacion.errores })

      // 2. Si cambió desde dónde arranca un video que ya estaba en Cloudinary, se pide el clip nuevo
      const avisosNuevos = []
      let pedidos = paraLaNube.length
      for (const clip of clipsDe(publicacion.proyectos)) {
        const claveClip = claveDeClip(clip)
        if (clipsPedidos.has(claveClip)) continue
        setPaso('Preparando los clips en Cloudinary…')
        try {
          await prepararVideo(pase, { id: clip.nube.id, uso: clip.uso, inicio: clip.inicio })
          clipsPedidos.add(claveClip)
          pedidos += 1
        } catch (problema) {
          avisosNuevos.push(`Cloudinary no pudo preparar un clip (${problema.message}). Si en unos minutos no se ve en la web, volvé a publicar.`)
        }
      }

      // 3. Las fotos (y los videos chicos, si no hay Cloudinary) van al repositorio
      const operaciones = [...publicacion.operaciones]
      const total = publicacion.subidas.length
      for (const [i, { archivo, destino }] of publicacion.subidas.entries()) {
        setPaso(total > 1 ? `Subiendo fotos y videos (${i + 1} de ${total})…` : 'Subiendo el archivo…')
        const { sha } = await subir(pase, archivo.blob)
        operaciones.push({ ruta: destino, sha })
      }

      setPaso('Guardando los cambios…')
      const respuesta = await publicar(pase, {
        sitio: publicacion.sitio,
        proyectos: publicacion.proyectos,
        archivos: operaciones,
        base: await obtenerBase(),
        resumen: cambios.join('; '),
      })
      setClave('')
      onPublicado({ respuesta, operaciones, estado: trabajo })
      setAvisos(avisosNuevos)
      setConVideos(pedidos > 0)
      setResultado(respuesta)
      setFase('listo')
    } catch (problema) {
      setError(problema)
      if (problema.codigo === 'clave') {
        setClave('')
        setFase('pidiendo')
      } else {
        setFase('error')
      }
    }
  }

  const ocupado = fase === 'trabajando'

  return (
    <dialog
      ref={dialogo}
      onCancel={(evento) => {
        evento.preventDefault()
        if (!ocupado) onCerrar()
      }}
      aria-labelledby={`${idClave}-titulo`}
      className="m-auto w-[min(560px,calc(100vw-32px))] max-h-[calc(100dvh-32px)] overflow-y-auto border-[3px] border-ink bg-paper p-0 text-ink backdrop:bg-ink/70"
    >
      <header className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-paper">
        <h2 id={`${idClave}-titulo`} className="display text-[28px] leading-none tracking-[.03em]">
          Publicar
        </h2>
        {!ocupado && (
          <button type="button" onClick={onCerrar} className="eyebrow min-h-10 px-2 hover:text-rec" aria-label="Cerrar">
            ✕
          </button>
        )}
      </header>

      <div className="flex flex-col gap-5 px-5 py-5">
        {(fase === 'pidiendo' || fase === 'trabajando') && (
          <>
            <div>
              <p className="eyebrow mb-2">Lo que va a cambiar en la web</p>
              <ul className="flex flex-col gap-1.5">
                {cambios.map((cambio) => (
                  <li key={cambio} className="flex gap-2 text-[15px] leading-[1.45]">
                    <span aria-hidden="true" className="mt-[7px] inline-block size-2 shrink-0 bg-rec" />
                    {cambio}
                  </li>
                ))}
              </ul>
            </div>

            {errores.length > 0 ? (
              <div role="alert" className="border-[3px] border-rec p-3">
                <p className="mb-2 font-bold text-rec">Antes de publicar, corregí esto:</p>
                <ul className="list-disc pl-5 text-[14px] leading-[1.5]">
                  {errores.map((texto) => (
                    <li key={texto}>{texto}</li>
                  ))}
                </ul>
                <Boton className="mt-3" onClick={onCerrar}>
                  Volver a editar
                </Boton>
              </div>
            ) : (
              <form onSubmit={confirmar} className="flex flex-col gap-4">
                {/* Ayuda a que el navegador ofrezca guardar la clave */}
                <input type="text" name="username" autoComplete="username" value="editor" readOnly hidden />
                <Texto
                  id={idClave}
                  etiqueta="Clave"
                  ayuda="Para confirmar que sos vos. El navegador puede recordarla."
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  valor={clave}
                  onCambio={setClave}
                  disabled={ocupado}
                  autoFocus
                />
                {error && fase === 'pidiendo' && (
                  <p role="alert" className="-mt-2 text-[14px] font-bold text-rec">
                    {error.message}
                  </p>
                )}
                <Boton variante="principal" type="submit" disabled={ocupado || !clave.trim()}>
                  {ocupado ? paso : 'Publicar'}
                </Boton>
              </form>
            )}
          </>
        )}

        {fase === 'listo' && (
          <div role="status" className="flex flex-col gap-3">
            {resultado?.sinCambios ? (
              <p className="text-[15px] leading-[1.55]">No había nada distinto para publicar.</p>
            ) : (
              <>
                <p className="display text-[32px] leading-none">Listo, quedó guardado</p>
                {enLaWeb === 'si' ? (
                  <p className="text-[15px] leading-[1.55]">
                    <strong>Ya está en la web.</strong>{' '}
                    <a href="/" target="_blank" rel="noreferrer" className="font-bold underline decoration-rec decoration-[3px] underline-offset-4">
                      Verla
                    </a>
                  </p>
                ) : enLaWeb === 'tarda' ? (
                  <p className="text-[15px] leading-[1.55]">
                    Está tardando más de lo normal. Si en unos minutos no se ve el cambio, avisale a Pablo (PF Software).
                  </p>
                ) : (
                  <p className="flex items-center gap-2.5 text-[15px] leading-[1.55]">
                    {enLaWeb === null && <span aria-hidden="true" className="rec-blink inline-block size-3 shrink-0 rounded-full bg-rec" />}
                    La web se está actualizando: en uno o dos minutos se ve el cambio.
                  </p>
                )}
                {conVideos && (
                  <p className="text-[14px] leading-[1.55] text-ink/75">
                    Cloudinary está preparando los clips: los videos nuevos pueden tardar unos minutos más en aparecer.
                  </p>
                )}
                {avisos.map((aviso) => (
                  <p key={aviso} className="border-l-[3px] border-rec pl-2.5 text-[14px] leading-[1.55]">
                    {aviso}
                  </p>
                ))}
              </>
            )}
            <Boton className="self-start" onClick={onCerrar}>
              Volver al editor
            </Boton>
          </div>
        )}

        {fase === 'error' && (
          <div role="alert" className="flex flex-col gap-3">
            <p className="font-bold text-rec">No se pudo publicar.</p>
            <p className="text-[15px] leading-[1.55]">{error?.message}</p>
            {error?.errores?.length > 0 && (
              <ul className="list-disc pl-5 text-[14px] leading-[1.5]">
                {error.errores.map((texto) => (
                  <li key={texto}>{texto}</li>
                ))}
              </ul>
            )}
            <p className="text-[13px] text-ink/70">Tus cambios siguen acá, no se perdió nada.</p>
            <div className="flex flex-wrap gap-2">
              <Boton onClick={() => setFase('pidiendo')}>Probar de nuevo</Boton>
              <Boton onClick={onCerrar}>Cerrar</Boton>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}
