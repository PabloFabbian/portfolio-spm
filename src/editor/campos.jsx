// Piezas de los formularios del editor
import { useId } from 'react'
import { BOTONES, CLASE_DE_ENTRADA } from './estilos'
import { mover } from './listas'

export function Boton({ variante = 'secundario', className = '', type = 'button', ...props }) {
  return <button type={type} className={`${BOTONES[variante]} ${className}`} {...props} />
}

/** Bloque del formulario con título */
export function Seccion({ titulo, ayuda, children, acciones }) {
  return (
    <section className="border-[3px] border-ink bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink bg-ink px-4 py-3 text-paper lg:px-5">
        <h2 className="display text-[22px] leading-none tracking-[.03em] lg:text-[26px]">{titulo}</h2>
        {acciones}
      </header>
      <div className="flex flex-col gap-6 px-4 py-5 lg:px-5 lg:py-6">
        {ayuda && <p className="text-[13px] leading-[1.55] text-ink/75">{ayuda}</p>}
        {children}
      </div>
    </section>
  )
}

export function Etiqueta({ htmlFor, children, ayuda }) {
  return (
    <div className="mb-2">
      <label htmlFor={htmlFor} className="eyebrow block">
        {children}
      </label>
      {ayuda && (
        <p id={`${htmlFor}-ayuda`} className="mt-1 text-[13px] leading-[1.5] text-ink/70">
          {ayuda}
        </p>
      )}
    </div>
  )
}

/** Campo de texto (una línea o varias) */
export function Texto({ etiqueta, ayuda, valor, onCambio, multilinea = false, max, placeholder, id: idPropio, ...resto }) {
  const idGenerado = useId()
  const id = idPropio ?? idGenerado
  const Elemento = multilinea ? 'textarea' : 'input'
  const largo = String(valor ?? '').length
  return (
    <div>
      {etiqueta && (
        <Etiqueta htmlFor={id} ayuda={ayuda}>
          {etiqueta}
        </Etiqueta>
      )}
      <Elemento
        id={id}
        className={`${CLASE_DE_ENTRADA} ${multilinea ? 'min-h-[120px] resize-y' : ''}`}
        value={valor ?? ''}
        onChange={(evento) => onCambio(evento.target.value)}
        placeholder={placeholder}
        rows={multilinea ? 4 : undefined}
        aria-describedby={etiqueta && ayuda ? `${id}-ayuda` : undefined}
        {...resto}
      />
      {max && largo > max * 0.85 && (
        <p className={`mt-1 text-right text-xs ${largo > max ? 'font-bold text-rec' : 'text-ink/60'}`}>
          {largo} / {max}
        </p>
      )}
    </div>
  )
}

/** Botones para mover o quitar un elemento de una lista */
export function Orden({ indice, total, onMover, onQuitar, nombre }) {
  return (
    <div className="flex shrink-0 gap-1.5">
      <Boton variante="chico" onClick={() => onMover(indice, indice - 1)} disabled={indice === 0} aria-label={`Subir ${nombre}`}>
        ↑
      </Boton>
      <Boton variante="chico" onClick={() => onMover(indice, indice + 1)} disabled={indice === total - 1} aria-label={`Bajar ${nombre}`}>
        ↓
      </Boton>
      <Boton variante="chico" onClick={() => onQuitar(indice)} aria-label={`Quitar ${nombre}`}>
        ✕
      </Boton>
    </div>
  )
}

/** Lista de textos (párrafos, palabras de la cinta, renglones del nombre) */
export function ListaDeTextos({ etiqueta, ayuda, valores, onCambio, max = 12, multilinea = false, textoAgregar = 'Agregar', nombre = 'elemento', largo }) {
  const id = useId()
  const cambiar = (i, texto) => onCambio(valores.map((v, j) => (j === i ? texto : v)))
  return (
    <fieldset>
      <legend className="sr-only">{etiqueta}</legend>
      <Etiqueta htmlFor={`${id}-0`} ayuda={ayuda}>
        {etiqueta}
      </Etiqueta>
      <ol className="flex flex-col gap-2">
        {valores.map((valor, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="eyebrow mt-3.5 w-5 shrink-0 text-right text-ink/50">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <Texto
                id={`${id}-${i}`}
                valor={valor}
                onCambio={(texto) => cambiar(i, texto)}
                multilinea={multilinea}
                max={largo}
                aria-label={`${etiqueta}: ${nombre} ${i + 1}`}
              />
            </div>
            <Orden
              indice={i}
              total={valores.length}
              nombre={`${nombre} ${i + 1}`}
              onMover={(a, b) => onCambio(mover(valores, a, b))}
              onQuitar={(a) => onCambio(valores.filter((_, j) => j !== a))}
            />
          </li>
        ))}
      </ol>
      {valores.length < max && (
        <Boton className="mt-3" onClick={() => onCambio([...valores, ''])}>
          + {textoAgregar}
        </Boton>
      )}
    </fieldset>
  )
}

/**
 * Lista de filas con varios campos (datos, ficha, créditos, tareas).
 * columnas: [{ clave, etiqueta, multilinea, largo }]. Cada fila tiene un _id.
 */
export function ListaDeFilas({ etiqueta, ayuda, filas, onCambio, columnas, crearFila, max = 12, textoAgregar = 'Agregar', nombre = 'fila' }) {
  const cambiar = (i, clave, texto) => onCambio(filas.map((fila, j) => (j === i ? { ...fila, [clave]: texto } : fila)))
  return (
    <fieldset>
      <legend className="eyebrow mb-2 block">{etiqueta}</legend>
      {ayuda && <p className="-mt-1 mb-2 text-[13px] leading-[1.5] text-ink/70">{ayuda}</p>}
      <ol className="flex flex-col gap-3">
        {filas.map((fila, i) => (
          <li key={fila._id} className="border-[3px] border-ink/25 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="eyebrow text-ink/60">
                {nombre} {i + 1}
              </span>
              <Orden
                indice={i}
                total={filas.length}
                nombre={`${nombre} ${i + 1}`}
                onMover={(a, b) => onCambio(mover(filas, a, b))}
                onQuitar={(a) => onCambio(filas.filter((_, j) => j !== a))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {columnas.map((columna) => (
                <Texto
                  key={columna.clave}
                  etiqueta={columna.etiqueta}
                  valor={fila[columna.clave]}
                  onCambio={(texto) => cambiar(i, columna.clave, texto)}
                  multilinea={columna.multilinea}
                  max={columna.largo}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
      {filas.length < max && (
        <Boton className="mt-3" onClick={() => onCambio([...filas, crearFila()])}>
          + {textoAgregar}
        </Boton>
      )}
    </fieldset>
  )
}

/** Elegir una opción entre pocas (botones) */
export function Opciones({ etiqueta, valor, opciones, onCambio }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-2 block">{etiqueta}</legend>
      <div className="flex flex-wrap gap-2">
        {opciones.map((opcion) => {
          const elegida = opcion.valor === valor
          return (
            <button
              key={opcion.valor}
              type="button"
              aria-pressed={elegida}
              onClick={() => onCambio(opcion.valor)}
              className={`eyebrow flex min-h-11 items-center gap-2 border-[3px] border-ink px-3.5 tracking-[.1em] transition-colors duration-150 ${
                elegida ? 'bg-ink text-paper' : 'bg-paper hover:bg-ink/10'
              }`}
            >
              {opcion.muestra && <span aria-hidden="true" className="inline-block size-3.5 border-2 border-current" style={{ background: opcion.muestra }} />}
              {opcion.etiqueta}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
