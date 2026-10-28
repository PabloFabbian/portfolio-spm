// Pestañas de la home: Portada, Sobre mí, Contacto y Compartir
import { nuevoId } from './estado'
import { CampoArchivo } from './CampoArchivo'
import { ListaDeFilas, ListaDeTextos, Seccion, Texto } from './campos'

export function PestanaPortada({ sitio, medios, cambiarSitio, cambiarMedio }) {
  return (
    <div className="flex flex-col gap-6">
      <Seccion titulo="Nombre y frase">
        <Texto
          etiqueta="Nombre completo"
          ayuda="Arriba a la izquierda, en el pie de la web y en la pestaña del navegador."
          valor={sitio.nombre}
          onCambio={(nombre) => cambiarSitio({ nombre })}
          max={80}
        />
        <ListaDeTextos
          etiqueta="Nombre gigante"
          ayuda="Un renglón por línea, hasta 3."
          valores={sitio.nombreEnRenglones}
          onCambio={(nombreEnRenglones) => cambiarSitio({ nombreEnRenglones })}
          max={3}
          largo={40}
          nombre="renglón"
          textoAgregar="Agregar renglón"
        />
        <Texto
          etiqueta="Profesión"
          ayuda="El recuadro negro debajo del nombre."
          valor={sitio.profesion}
          onCambio={(profesion) => cambiarSitio({ profesion })}
          max={80}
        />
        <Texto
          etiqueta="Frase"
          ayuda="Sin comillas: se agregan solas."
          valor={sitio.frase}
          onCambio={(frase) => cambiarSitio({ frase })}
          multilinea
          max={200}
        />
        <Texto
          etiqueta="Año"
          ayuda="Aparece en «Portfolio 2026» y en el © del pie."
          valor={String(sitio.anio ?? '')}
          onCambio={(anio) => cambiarSitio({ anio })}
          inputMode="numeric"
          maxLength={4}
        />
      </Seccion>

      <Seccion titulo="Fotos de la portada" ayuda="Se ven recortadas en cuadrado en el celular y un poco más verticales en la compu: dejá la cara al centro.">
        <CampoArchivo
          etiqueta="Foto fija"
          archivo={medios['portada-1']}
          onCambio={(archivo) => cambiarMedio('portada-1', archivo)}
          proporcion="aspect-square"
        />
        <CampoArchivo
          etiqueta="Foto que aparece y desaparece"
          ayuda="Se funde lentamente sobre la foto fija. Si no hay, se ve solo la fija."
          archivo={medios['portada-2']}
          onCambio={(archivo) => cambiarMedio('portada-2', archivo)}
          proporcion="aspect-square"
        />
      </Seccion>

      <Seccion titulo="Cinta" ayuda="Las palabras rojas que pasan en la cinta negra debajo de la portada.">
        <ListaDeTextos
          etiqueta="Palabras"
          valores={sitio.cinta}
          onCambio={(cinta) => cambiarSitio({ cinta })}
          max={12}
          largo={60}
          nombre="palabra"
          textoAgregar="Agregar palabra"
        />
      </Seccion>
    </div>
  )
}

export function PestanaSobreMi({ sitio, medios, cambiarSobreMi, cambiarMedio }) {
  const { sobreMi } = sitio
  return (
    <div className="flex flex-col gap-6">
      <Seccion titulo="Retrato">
        <CampoArchivo
          ayuda="Vertical, con la cara al centro."
          archivo={medios['sobre-mi']}
          onCambio={(archivo) => cambiarMedio('sobre-mi', archivo)}
        />
      </Seccion>
      <Seccion titulo="Texto">
        <Texto etiqueta="Título" valor={sobreMi.titulo} onCambio={(titulo) => cambiarSobreMi({ titulo })} max={120} />
        <ListaDeTextos
          etiqueta="Párrafos"
          ayuda="Cada cuadro es un párrafo. Para empezar otro, tocá «Agregar párrafo»."
          valores={sobreMi.parrafos}
          onCambio={(parrafos) => cambiarSobreMi({ parrafos })}
          multilinea
          max={10}
          largo={1500}
          nombre="párrafo"
          textoAgregar="Agregar párrafo"
        />
      </Seccion>
      <Seccion titulo="Tabla de datos" ayuda="Los renglones de abajo del texto (Rol principal, Formación, Ubicación…).">
        <ListaDeFilas
          etiqueta="Datos"
          filas={sobreMi.datos}
          onCambio={(datos) => cambiarSobreMi({ datos })}
          columnas={[
            { clave: 'dato', etiqueta: 'Dato', largo: 60 },
            { clave: 'valor', etiqueta: 'Valor', multilinea: true, largo: 400 },
          ]}
          crearFila={() => ({ dato: '', valor: '', _id: nuevoId() })}
          max={12}
          nombre="Dato"
          textoAgregar="Agregar dato"
        />
      </Seccion>
    </div>
  )
}

export function PestanaContacto({ sitio, cambiarContacto }) {
  const { contacto } = sitio
  return (
    <Seccion titulo="Contacto">
      <Texto
        etiqueta="Email"
        valor={contacto.email}
        onCambio={(email) => cambiarContacto({ email })}
        type="email"
        inputMode="email"
        autoCapitalize="none"
        max={120}
      />
      <Texto
        etiqueta="Instagram"
        ayuda="El usuario, sin @."
        valor={contacto.instagram}
        onCambio={(instagram) => cambiarContacto({ instagram })}
        autoCapitalize="none"
        max={60}
      />
      <Texto
        etiqueta="WhatsApp, como se lee"
        ayuda="Así aparece escrito en la web, por ejemplo +54 9 11 6176-1500."
        valor={contacto.whatsappVisible}
        onCambio={(whatsappVisible) => cambiarContacto({ whatsappVisible })}
        inputMode="tel"
        max={40}
      />
      <Texto
        etiqueta="WhatsApp, para el botón"
        ayuda="Solo números y todo junto: 54 + 9 + código de área + número (por ejemplo 5491161761500)."
        valor={contacto.whatsappNumero}
        onCambio={(whatsappNumero) => cambiarContacto({ whatsappNumero })}
        inputMode="numeric"
        max={15}
      />
      <Texto
        etiqueta="Mensaje que aparece ya escrito en WhatsApp"
        valor={contacto.whatsappMensaje}
        onCambio={(whatsappMensaje) => cambiarContacto({ whatsappMensaje })}
        multilinea
        max={300}
      />
    </Seccion>
  )
}

export function PestanaCompartir({ medios, cambiarMedio }) {
  return (
    <Seccion
      titulo="Imagen para compartir"
      ayuda="La que aparece cuando alguien comparte el link de la web por WhatsApp, Instagram o LinkedIn. Se recorta sola a 1200 × 630, al centro. Puede tardar unos días en actualizarse en esas apps."
    >
      <CampoArchivo
        archivo={medios.compartir}
        onCambio={(archivo) => cambiarMedio('compartir', archivo)}
        proporcion="aspect-[1200/630]"
        ancho="w-56 lg:w-72"
        recorte={{ ancho: 1200, alto: 630 }}
        quitable={false}
      />
    </Seccion>
  )
}
