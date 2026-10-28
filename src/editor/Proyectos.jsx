// Pestaña Proyectos: la lista (ordenar, agregar, borrar) y el formulario de cada proyecto
import { useId, useState } from 'react'
import { COLORES, MAX_GALERIA, MAX_PROYECTOS } from '../lib/contenido.js'
import { CampoArchivo } from './CampoArchivo'
import { Boton, ListaDeFilas, ListaDeTextos, Opciones, Orden, Seccion, Texto } from './campos'
import { nuevoId } from './estado'
import { mover } from './listas'

const MUESTRAS = { negro: '#0b0b0b', hueso: '#ece6da', rojo: '#c4301f' }
const OPCIONES_DE_COLOR = COLORES.map((color) => ({ valor: color, etiqueta: color, muestra: MUESTRAS[color] }))

function Miniatura({ proyecto }) {
  const archivo = proyecto._medios.tarjeta ?? proyecto._medios.afiche ?? proyecto._medios['imagen-principal']
  return (
    <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden border-[3px] border-ink lg:w-16" style={{ background: MUESTRAS[proyecto.colores.fondo] }}>
      {archivo?.kind === 'image' && <img src={archivo.url} alt="" className="absolute inset-0 h-full w-full object-cover" />}
    </div>
  )
}

export function ListaDeProyectos({ proyectos, onCambio, onAbrir, onAgregar }) {
  const idNuevo = useId()
  const [nuevoTitulo, setNuevoTitulo] = useState('')
  const [agregando, setAgregando] = useState(false)
  const [borrando, setBorrando] = useState(null)

  function agregar(evento) {
    evento.preventDefault()
    const titulo = nuevoTitulo.trim()
    if (!titulo) return
    onAgregar(titulo)
    setNuevoTitulo('')
    setAgregando(false)
  }

  return (
    <Seccion
      titulo="Proyectos"
      ayuda="El orden de esta lista es el orden de la web. Tocá un proyecto para editar sus textos, fotos y videos."
    >
      <ol className="flex flex-col gap-3">
        {proyectos.map((proyecto, i) => (
          <li key={proyecto._id} className="border-[3px] border-ink bg-white/40 p-3">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => onAbrir(proyecto._id)} className="group flex min-w-0 flex-1 items-center gap-3 text-left">
                <Miniatura proyecto={proyecto} />
                <span className="min-w-0">
                  <span className="display block text-2xl leading-none group-hover:text-rec lg:text-[28px]">{proyecto.titulo || 'Sin título'}</span>
                  <span className="mt-1 block truncate text-xs tracking-[.06em] text-ink/70 uppercase">{proyecto.lineaEnLaLista || `/proyectos/${proyecto.carpeta}`}</span>
                </span>
              </button>
              <div className="flex gap-1.5">
                <Boton variante="chico" onClick={() => onCambio(mover(proyectos, i, i - 1))} disabled={i === 0} aria-label={`Subir ${proyecto.titulo}`}>
                  ↑
                </Boton>
                <Boton
                  variante="chico"
                  onClick={() => onCambio(mover(proyectos, i, i + 1))}
                  disabled={i === proyectos.length - 1}
                  aria-label={`Bajar ${proyecto.titulo}`}
                >
                  ↓
                </Boton>
                <Boton onClick={() => onAbrir(proyecto._id)}>Editar</Boton>
                <Boton variante="chico" onClick={() => setBorrando(proyecto._id)} aria-label={`Borrar ${proyecto.titulo}`}>
                  ✕
                </Boton>
              </div>
            </div>
            {borrando === proyecto._id && (
              <div role="alert" className="mt-3 flex flex-wrap items-center gap-3 border-t-[3px] border-ink/20 pt-3">
                <p className="text-[13px] font-bold text-rec">
                  ¿Borrar «{proyecto.titulo || 'Sin título'}»? Al publicar se borran también sus fotos y videos.
                </p>
                <div className="flex gap-2">
                  <Boton
                    variante="peligro"
                    onClick={() => {
                      onCambio(proyectos.filter((p) => p._id !== proyecto._id))
                      setBorrando(null)
                    }}
                  >
                    Sí, borrar
                  </Boton>
                  <Boton onClick={() => setBorrando(null)}>Cancelar</Boton>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>

      {proyectos.length < MAX_PROYECTOS &&
        (agregando ? (
          <form onSubmit={agregar} className="flex flex-wrap items-end gap-3 border-[3px] border-dashed border-ink p-3">
            <div className="min-w-[220px] flex-1">
              <Texto
                id={idNuevo}
                etiqueta="Nombre del proyecto nuevo"
                ayuda="También arma la dirección de la página (por ejemplo /proyectos/nuevo-videoclip). Después no se puede cambiar."
                valor={nuevoTitulo}
                onCambio={setNuevoTitulo}
                max={80}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Boton type="submit" disabled={!nuevoTitulo.trim()}>
                Crear
              </Boton>
              <Boton onClick={() => setAgregando(false)}>Cancelar</Boton>
            </div>
          </form>
        ) : (
          <Boton className="self-start" onClick={() => setAgregando(true)}>
            + Agregar proyecto
          </Boton>
        ))}
    </Seccion>
  )
}

function Galeria({ galeria, onCambio }) {
  const piezas = galeria.piezas
  const cambiarPieza = (i, cambio) => onCambio({ ...galeria, piezas: piezas.map((p, j) => (j === i ? { ...p, ...cambio } : p)) })

  return (
    <Seccion
      titulo="Carrusel"
      ayuda="Fotos y videos verticales (4:5). Se ven de a 3 en la compu y de a 1 en el celular, en este orden. Videos MP4 de 10 a 15 segundos y hasta 4 MB."
    >
      <Texto etiqueta="Título del carrusel" valor={galeria.titulo} onCambio={(titulo) => onCambio({ ...galeria, titulo })} max={80} />
      <ol className="flex flex-col gap-3">
        {piezas.map((pieza, i) => (
          <li key={pieza._id} className="border-[3px] border-ink/25 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="eyebrow text-ink/60">
                Pieza {i + 1} · {pieza.tipo === 'video' ? 'video' : 'foto'}
              </span>
              <Orden
                indice={i}
                total={piezas.length}
                nombre={`pieza ${i + 1}`}
                onMover={(a, b) => onCambio({ ...galeria, piezas: mover(piezas, a, b) })}
                onQuitar={(a) => onCambio({ ...galeria, piezas: piezas.filter((_, j) => j !== a) })}
              />
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="md:w-72 md:shrink-0">
                <CampoArchivo
                  archivo={pieza._archivo}
                  acepta="ambos"
                  ancho="w-24 lg:w-28"
                  onCambio={(archivo) =>
                    cambiarPieza(i, { _archivo: archivo, ...(archivo ? { tipo: archivo.kind === 'video' ? 'video' : 'foto' } : {}) })
                  }
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {!pieza._archivo && (
                  <Opciones
                    etiqueta="Va a ser"
                    valor={pieza.tipo}
                    opciones={[
                      { valor: 'foto', etiqueta: 'Foto' },
                      { valor: 'video', etiqueta: 'Video' },
                    ]}
                    onCambio={(tipo) => cambiarPieza(i, { tipo })}
                  />
                )}
                <Texto etiqueta="Título" valor={pieza.titulo} onCambio={(titulo) => cambiarPieza(i, { titulo })} max={80} />
                {pieza.tipo !== 'video' && (
                  <Texto
                    etiqueta="Cómo se hizo"
                    ayuda="Aparece al pasar el cursor por la foto (en el celular, al tocarla). Opcional."
                    valor={pieza.comoSeHizo}
                    onCambio={(comoSeHizo) => cambiarPieza(i, { comoSeHizo })}
                    multilinea
                    max={300}
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      {piezas.length < MAX_GALERIA && (
        <Boton
          className="self-start"
          onClick={() => onCambio({ ...galeria, piezas: [...piezas, { tipo: 'foto', titulo: '', comoSeHizo: '', _id: nuevoId(), _archivo: null }] })}
        >
          + Agregar pieza
        </Boton>
      )}
    </Seccion>
  )
}

export function FormularioDeProyecto({ proyecto, onCambio, onVolver, onVistaPrevia }) {
  const cambiar = (cambio) => onCambio({ ...proyecto, ...cambio })
  const cambiarMedio = (nombre, archivo) => onCambio({ ...proyecto, _medios: { ...proyecto._medios, [nombre]: archivo } })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Boton onClick={onVolver}>← Todos los proyectos</Boton>
        <Boton onClick={onVistaPrevia}>Ver este proyecto</Boton>
      </div>
      <h2 className="display knockout text-[length:clamp(40px,9vw,72px)] leading-[.9]">{proyecto.titulo || 'Sin título'}</h2>
      <p className="-mt-3 text-[13px] text-ink/70">
        Dirección: <strong>/proyectos/{proyecto.carpeta}</strong>
      </p>

      <Seccion titulo="En la lista de trabajos">
        <Texto etiqueta="Título" valor={proyecto.titulo} onCambio={(titulo) => cambiar({ titulo })} max={80} />
        <Texto
          etiqueta="Línea chica debajo del título"
          ayuda="Por ejemplo: Proyecto personal · Producción integral · 2026."
          valor={proyecto.lineaEnLaLista}
          onCambio={(lineaEnLaLista) => cambiar({ lineaEnLaLista })}
          max={160}
        />
        <CampoArchivo
          etiqueta="Tarjeta"
          ayuda="Foto vertical (4:5) que se ve en la lista de trabajos. Si no hay, se usa el afiche."
          archivo={proyecto._medios.tarjeta}
          onCambio={(archivo) => cambiarMedio('tarjeta', archivo)}
        />
        <Opciones
          etiqueta="Color de fondo de la tarjeta (mientras no haya foto)"
          valor={proyecto.colores.fondo}
          opciones={OPCIONES_DE_COLOR}
          onCambio={(fondo) => cambiar({ colores: { ...proyecto.colores, fondo } })}
        />
        <Opciones
          etiqueta="Color de los puntos"
          valor={proyecto.colores.puntos}
          opciones={OPCIONES_DE_COLOR}
          onCambio={(puntos) => cambiar({ colores: { ...proyecto.colores, puntos } })}
        />
      </Seccion>

      <Seccion titulo="Arriba de la página">
        <Texto
          etiqueta="Etiqueta"
          ayuda="El recuadro negro con el punto rojo, arriba del título."
          valor={proyecto.etiqueta}
          onCambio={(etiqueta) => cambiar({ etiqueta })}
          max={60}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Texto etiqueta="Categoría" valor={proyecto.categoria} onCambio={(categoria) => cambiar({ categoria })} max={80} />
          <Texto etiqueta="Año" valor={proyecto.anio} onCambio={(anio) => cambiar({ anio })} max={40} />
        </div>
        <ListaDeTextos
          etiqueta="Título gigante"
          ayuda="Un renglón por línea, hasta 3."
          valores={proyecto.tituloEnRenglones}
          onCambio={(tituloEnRenglones) => cambiar({ tituloEnRenglones })}
          max={3}
          largo={40}
          nombre="renglón"
          textoAgregar="Agregar renglón"
        />
        <Texto
          etiqueta="Texto al lado del título"
          valor={proyecto.bajada}
          onCambio={(bajada) => cambiar({ bajada })}
          multilinea
          max={400}
        />
      </Seccion>

      <Seccion titulo="Video principal" ayuda="El video grande, en loop y sin sonido. Se ve vertical en el celular y muy apaisado en la compu: dejá lo importante al centro.">
        <CampoArchivo
          etiqueta="Video"
          ayuda="MP4 horizontal (16:9), de 10 a 15 segundos y hasta 4 MB."
          archivo={proyecto._medios['video-principal']}
          onCambio={(archivo) => cambiarMedio('video-principal', archivo)}
          acepta="video"
          proporcion="aspect-video"
          ancho="w-40 lg:w-52"
        />
        <CampoArchivo
          etiqueta="Imagen (si no hay video)"
          ayuda="Foto horizontal (16:9) que va en lugar del video."
          archivo={proyecto._medios['imagen-principal']}
          onCambio={(archivo) => cambiarMedio('imagen-principal', archivo)}
          proporcion="aspect-video"
          ancho="w-40 lg:w-52"
          ladoMaximo={2400}
        />
        <Texto
          etiqueta="Texto chico sobre el video (opcional)"
          ayuda="Abajo a la derecha, por ejemplo «4K · 25 FPS». Vacío = no aparece."
          valor={proyecto.formatoDeCamara}
          onCambio={(formatoDeCamara) => cambiar({ formatoDeCamara })}
          max={60}
        />
      </Seccion>

      <Seccion titulo="Ficha" ayuda="Los recuadros debajo del video (Rol, Tareas, Formato, Año…). Hasta 8.">
        <ListaDeFilas
          etiqueta="Recuadros"
          filas={proyecto.ficha}
          onCambio={(ficha) => cambiar({ ficha })}
          columnas={[
            { clave: 'dato', etiqueta: 'Dato', largo: 40 },
            { clave: 'valor', etiqueta: 'Valor', largo: 200 },
          ]}
          crearFila={() => ({ dato: '', valor: '', _id: nuevoId() })}
          max={8}
          nombre="Recuadro"
          textoAgregar="Agregar recuadro"
        />
      </Seccion>

      <Seccion titulo="Sobre el proyecto">
        <CampoArchivo
          etiqueta="Afiche"
          ayuda="Foto vertical (4:5) al lado del texto."
          archivo={proyecto._medios.afiche}
          onCambio={(archivo) => cambiarMedio('afiche', archivo)}
        />
        <Texto etiqueta="Frase grande" valor={proyecto.frase} onCambio={(frase) => cambiar({ frase })} multilinea max={300} />
        <ListaDeTextos
          etiqueta="Párrafos"
          valores={proyecto.texto}
          onCambio={(texto) => cambiar({ texto })}
          multilinea
          max={10}
          largo={1500}
          nombre="párrafo"
          textoAgregar="Agregar párrafo"
        />
      </Seccion>

      <Seccion titulo="Cinta negra (opcional)" ayuda="Palabras que pasan en una cinta. Sin palabras, la cinta no aparece.">
        <ListaDeTextos
          etiqueta="Palabras"
          valores={proyecto.cinta}
          onCambio={(cinta) => cambiar({ cinta })}
          max={12}
          largo={60}
          nombre="palabra"
          textoAgregar="Agregar palabra"
        />
      </Seccion>

      <Seccion titulo="Lo que hice (opcional)" ayuda="Sin tareas, la sección no aparece.">
        <Texto
          etiqueta="Intro"
          valor={proyecto.queHice.intro}
          onCambio={(intro) => cambiar({ queHice: { ...proyecto.queHice, intro } })}
          multilinea
          max={300}
        />
        <ListaDeFilas
          etiqueta="Tareas"
          filas={proyecto.queHice.tareas}
          onCambio={(tareas) => cambiar({ queHice: { ...proyecto.queHice, tareas } })}
          columnas={[
            { clave: 'momento', etiqueta: 'Momento (Antes, Durante…)', largo: 40 },
            { clave: 'titulo', etiqueta: 'Título', largo: 60 },
            { clave: 'texto', etiqueta: 'Texto', multilinea: true, largo: 400 },
          ]}
          crearFila={() => ({ momento: '', titulo: '', texto: '', _id: nuevoId() })}
          max={8}
          nombre="Tarea"
          textoAgregar="Agregar tarea"
        />
      </Seccion>

      <Galeria galeria={proyecto.galeria} onCambio={(galeria) => cambiar({ galeria })} />

      <Seccion titulo="Créditos">
        <ListaDeFilas
          etiqueta="Créditos"
          filas={proyecto.creditos}
          onCambio={(creditos) => cambiar({ creditos })}
          columnas={[
            { clave: 'rol', etiqueta: 'Rol', largo: 60 },
            { clave: 'nombre', etiqueta: 'Nombre', largo: 120 },
          ]}
          crearFila={() => ({ rol: '', nombre: '', _id: nuevoId() })}
          max={20}
          nombre="Crédito"
          textoAgregar="Agregar crédito"
        />
      </Seccion>

      <Boton className="self-start" onClick={onVolver}>
        ← Todos los proyectos
      </Boton>
    </div>
  )
}
