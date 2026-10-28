/*
 * Editor de contenido (/editar).
 * Todo se cambia acá, en el navegador, y no toca la web hasta que se toca Publicar
 * y se confirma con la clave (ver api/ y COMO-EDITAR.md).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Page } from '../components/Page'
import { useDocumentTitle } from '../hooks/usePageScroll'
import { consultarEstado } from '../editor/api'
import { Boton } from '../editor/campos'
import {
  RUTAS_PUBLICADAS,
  baseInicial,
  crearEstadoInicial,
  datosDeVistaPrevia,
  estadoPublicado,
  listarCambios,
  partesDe,
  proyectoNuevo,
  rutasDespues,
} from '../editor/estado'
import { FormularioDeProyecto, ListaDeProyectos } from '../editor/Proyectos'
import { Publicar } from '../editor/Publicar'
import { PestanaCompartir, PestanaContacto, PestanaPortada, PestanaSobreMi } from '../editor/Secciones'
import { VistaPrevia } from '../editor/VistaPrevia'

const ESTADO_INICIAL = crearEstadoInicial()

const PESTANAS = [
  { id: 'portada', nombre: 'Portada' },
  { id: 'sobre-mi', nombre: 'Sobre mí' },
  { id: 'proyectos', nombre: 'Proyectos' },
  { id: 'contacto', nombre: 'Contacto' },
  { id: 'compartir', nombre: 'Compartir' },
]

/** Le pide a los buscadores que no muestren esta página */
function useNoIndexar() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.append(meta)
    return () => meta.remove()
  }, [])
}

export default function Editor() {
  const [inicial, setInicial] = useState(ESTADO_INICIAL)
  const [estado, setEstado] = useState(ESTADO_INICIAL)
  const [publicados, setPublicados] = useState(RUTAS_PUBLICADAS)
  const [pestana, setPestana] = useState('portada')
  const [abierto, setAbierto] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState(null)
  const [publicando, setPublicando] = useState(false)
  const [descartando, setDescartando] = useState(false)
  const [servidor, setServidor] = useState(null)
  const base = useRef(null)

  const cambios = useMemo(() => listarCambios(estado, inicial), [estado, inicial])
  const hayCambios = cambios.length > 0
  const proyectoAbierto = estado.proyectos.find((p) => p._id === abierto) ?? null

  useDocumentTitle(`Editor · ${estado.sitio.nombre}`)
  useNoIndexar()

  useEffect(() => {
    let vivo = true
    consultarEstado()
      .then((datos) => vivo && setServidor(datos))
      .catch((error) => vivo && setServidor({ listo: false, problemas: [error.message] }))
    return () => {
      vivo = false
    }
  }, [])

  // Avisa antes de cerrar la pestaña con cambios sin publicar
  useEffect(() => {
    if (!hayCambios) return undefined
    const avisar = (evento) => evento.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [hayCambios])

  const cambiarSitio = (cambio) => setEstado((e) => ({ ...e, sitio: { ...e.sitio, ...cambio } }))
  const cambiarSobreMi = (cambio) => setEstado((e) => ({ ...e, sitio: { ...e.sitio, sobreMi: { ...e.sitio.sobreMi, ...cambio } } }))
  const cambiarContacto = (cambio) => setEstado((e) => ({ ...e, sitio: { ...e.sitio, contacto: { ...e.sitio.contacto, ...cambio } } }))
  const cambiarMedio = (nombre, archivo) => setEstado((e) => ({ ...e, medios: { ...e.medios, [nombre]: archivo } }))
  const cambiarProyectos = (proyectos) => setEstado((e) => ({ ...e, proyectos }))
  const cambiarProyecto = (proyecto) =>
    setEstado((e) => ({ ...e, proyectos: e.proyectos.map((p) => (p._id === proyecto._id ? proyecto : p)) }))

  function agregarProyecto(titulo) {
    const usadas = new Set([
      ...estado.proyectos.map((p) => p.carpeta),
      ...inicial.proyectos.map((p) => p.carpeta),
      ...publicados.map((ruta) => partesDe(ruta).carpeta.replace('contenido/proyectos/', '')),
    ])
    const proyecto = proyectoNuevo(titulo, usadas, estado.sitio.nombre)
    setEstado((e) => ({ ...e, proyectos: [...e.proyectos, proyecto] }))
    setAbierto(proyecto._id)
  }

  function abrirVistaPrevia(pagina = '/') {
    window.__SPM_VISTA_PREVIA__ = datosDeVistaPrevia(estado)
    setVistaPrevia(pagina)
  }

  async function obtenerBase() {
    base.current ??= await baseInicial()
    return base.current
  }

  function alPublicar({ respuesta, operaciones }) {
    if (respuesta.archivos) base.current = respuesta.archivos
    const nuevo = estadoPublicado(estado)
    setPublicados((rutas) => rutasDespues(rutas, operaciones))
    setInicial(nuevo)
    setEstado(nuevo)
  }

  function descartar() {
    setEstado(inicial)
    setDescartando(false)
    setAbierto(null)
  }

  const paginas = [
    { ruta: '/', nombre: 'Inicio' },
    ...estado.proyectos.map((p) => ({ ruta: `/proyectos/${p.carpeta}`, nombre: p.titulo || 'Sin título' })),
  ]

  return (
    <Page>
      <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-ink text-paper">
        {/* Celular: "Editor" y los botones en una fila, el estado abajo. Compu: el estado debajo de "Editor" */}
        <div className="mx-auto grid max-w-[1100px] grid-cols-[1fr_auto] items-center gap-x-2.5 gap-y-1.5 px-4 py-3 sm:gap-x-4 lg:px-6">
          <p className="display col-start-1 row-start-1 text-[24px] leading-none tracking-[.03em] lg:text-[30px]">Editor</p>
          <p className="eyebrow col-span-2 row-start-2 flex items-center gap-2 text-[10px] text-paper/70 sm:col-span-1 sm:col-start-1 lg:text-[11px]">
            <span aria-hidden="true" className={`inline-block size-2 rounded-full ${hayCambios ? 'bg-rec' : 'bg-paper/40'}`} />
            {hayCambios ? `${cambios.length} cambio${cambios.length === 1 ? '' : 's'} sin publicar` : 'Todo publicado'}
          </p>
          <div className="col-start-2 row-start-1 flex items-center gap-2.5 sm:row-span-2 sm:gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="eyebrow hidden min-h-11 items-center border-[3px] border-paper px-3.5 tracking-[.1em] hover:bg-paper hover:text-ink sm:inline-flex"
            >
              Ver la web ↗
            </a>
            <button
              type="button"
              onClick={() => abrirVistaPrevia(proyectoAbierto ? `/proyectos/${proyectoAbierto.carpeta}` : '/')}
              className="eyebrow inline-flex min-h-11 items-center border-[3px] border-paper px-2.5 text-[11px] tracking-[.08em] hover:bg-paper hover:text-ink sm:px-3.5 sm:text-xs sm:tracking-[.1em]"
            >
              Vista previa
            </button>
            <Boton variante="principal" className="px-4! sm:px-5!" onClick={() => setPublicando(true)} disabled={!hayCambios}>
              Publicar
            </Boton>
          </div>
        </div>
        <nav aria-label="Secciones del editor" className="border-t-[3px] border-paper/15">
          <ul className="mx-auto flex max-w-[1100px] overflow-x-auto px-2 [scrollbar-width:none] lg:px-4 [&::-webkit-scrollbar]:hidden">
            {PESTANAS.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  aria-current={pestana === p.id ? 'page' : undefined}
                  onClick={() => {
                    setPestana(p.id)
                    setAbierto(null)
                    window.scrollTo({ top: 0, behavior: 'instant' })
                  }}
                  className={`eyebrow min-h-11 px-3 tracking-[.1em] whitespace-nowrap transition-colors duration-150 lg:px-4 ${
                    pestana === p.id ? 'bg-paper text-ink' : 'text-paper/80 hover:text-paper'
                  }`}
                >
                  {p.nombre}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="contenido" className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-6 lg:px-6 lg:py-8">
        {servidor && !servidor.listo && (
          <div role="status" className="border-[3px] border-rec bg-white/50 p-4 text-[14px] leading-[1.55]">
            <p className="font-bold text-rec">Por ahora se puede editar y ver la vista previa, pero todavía no publicar.</p>
            <ul className="mt-1 list-disc pl-5">
              {servidor.problemas.map((problema) => (
                <li key={problema}>{problema}</li>
              ))}
            </ul>
            <p className="mt-1 text-ink/70">Los pasos para configurarlo están en el README del proyecto.</p>
          </div>
        )}

        <p className="text-[13px] leading-[1.55] text-ink/75">
          Los cambios quedan en esta pantalla hasta que tocás <strong>Publicar</strong>: ahí se pide la clave y, uno o dos minutos después, se ven en la web.
        </p>

        {pestana === 'portada' && (
          <PestanaPortada sitio={estado.sitio} medios={estado.medios} cambiarSitio={cambiarSitio} cambiarMedio={cambiarMedio} />
        )}
        {pestana === 'sobre-mi' && (
          <PestanaSobreMi sitio={estado.sitio} medios={estado.medios} cambiarSobreMi={cambiarSobreMi} cambiarMedio={cambiarMedio} />
        )}
        {pestana === 'proyectos' &&
          (proyectoAbierto ? (
            <FormularioDeProyecto
              proyecto={proyectoAbierto}
              onCambio={cambiarProyecto}
              onVolver={() => setAbierto(null)}
              onVistaPrevia={() => abrirVistaPrevia(`/proyectos/${proyectoAbierto.carpeta}`)}
            />
          ) : (
            <ListaDeProyectos
              proyectos={estado.proyectos}
              onCambio={cambiarProyectos}
              onAbrir={(id) => {
                setAbierto(id)
                window.scrollTo({ top: 0, behavior: 'instant' })
              }}
              onAgregar={agregarProyecto}
            />
          ))}
        {pestana === 'contacto' && <PestanaContacto sitio={estado.sitio} cambiarContacto={cambiarContacto} />}
        {pestana === 'compartir' && <PestanaCompartir medios={estado.medios} cambiarMedio={cambiarMedio} />}

        {hayCambios && (
          <div className="flex flex-wrap items-center gap-3 border-t-[3px] border-ink pt-5">
            {descartando ? (
              <>
                <p className="text-[13px] font-bold text-rec">¿Deshacer todos los cambios sin publicar?</p>
                <Boton variante="peligro" onClick={descartar}>
                  Sí, deshacer
                </Boton>
                <Boton onClick={() => setDescartando(false)}>No</Boton>
              </>
            ) : (
              <Boton onClick={() => setDescartando(true)}>Deshacer los cambios sin publicar</Boton>
            )}
          </div>
        )}
      </main>

      {vistaPrevia && <VistaPrevia paginas={paginas} paginaInicial={vistaPrevia} onCerrar={() => setVistaPrevia(null)} />}
      {publicando && (
        <Publicar
          estado={estado}
          inicial={inicial}
          publicados={publicados}
          cambios={cambios}
          obtenerBase={obtenerBase}
          onCerrar={() => setPublicando(false)}
          onPublicado={alPublicar}
        />
      )}
    </Page>
  )
}
