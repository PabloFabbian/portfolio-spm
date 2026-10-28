// Vista previa: la web real, adentro de un recuadro, con el borrador del editor
import { useEffect, useId, useRef, useState } from 'react'
import { Boton } from './campos'

export function VistaPrevia({ paginas, paginaInicial = '/', onCerrar }) {
  const dialogo = useRef(null)
  const idPagina = useId()
  const [pagina, setPagina] = useState(paginaInicial)
  const [celular, setCelular] = useState(false)

  useEffect(() => {
    const ventana = dialogo.current
    ventana?.showModal()
    return () => ventana?.close()
  }, [])

  return (
    <dialog
      ref={dialogo}
      onCancel={(evento) => {
        evento.preventDefault()
        onCerrar()
      }}
      aria-label="Vista previa"
      className="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-ink p-0 backdrop:bg-ink"
    >
      <div className="flex h-full flex-col">
        <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-[3px] border-paper/20 px-3 py-2.5 text-paper lg:px-5">
          <p className="eyebrow flex items-center gap-2 text-[11px] lg:text-xs">
            <span aria-hidden="true" className="rec-blink inline-block size-2.5 rounded-full bg-rec" />
            Vista previa · sin publicar
          </p>
          <label htmlFor={idPagina} className="sr-only">
            Página
          </label>
          <select
            id={idPagina}
            value={pagina}
            onChange={(evento) => setPagina(evento.target.value)}
            className="eyebrow min-h-10 max-w-[60vw] border-[3px] border-paper bg-ink px-2 text-paper"
          >
            {paginas.map((opcion) => (
              <option key={opcion.ruta} value={opcion.ruta}>
                {opcion.nombre}
              </option>
            ))}
          </select>
          <div className="flex gap-1.5" role="group" aria-label="Tamaño">
            {[
              [false, 'Compu'],
              [true, 'Celu'],
            ].map(([esCelular, texto]) => (
              <button
                key={texto}
                type="button"
                aria-pressed={celular === esCelular}
                onClick={() => setCelular(esCelular)}
                className={`eyebrow hidden min-h-10 border-[3px] border-paper px-3 md:block ${celular === esCelular ? 'bg-paper text-ink' : 'text-paper'}`}
              >
                {texto}
              </button>
            ))}
          </div>
          <Boton variante="principal" className="ml-auto" onClick={onCerrar}>
            Volver a editar
          </Boton>
        </header>
        <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-ink">
          <iframe
            key={pagina}
            title="Vista previa de la web"
            src={`${pagina}?vista-previa=1`}
            className={`h-full bg-paper ${celular ? 'w-[390px] max-w-full border-x-[3px] border-paper/30' : 'w-full'}`}
          />
        </div>
      </div>
    </dialog>
  )
}
