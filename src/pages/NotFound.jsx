import { Link } from 'react-router'
import { Header } from '../components/Header'
import { ArrowLeft } from '../components/icons'
import { Page } from '../components/Page'
import { site } from '../data/site'
import { useDocumentTitle } from '../hooks/usePageScroll'

export default function NotFound() {
  useDocumentTitle(`Página no encontrada · ${site.name}`)

  return (
    <Page>
      <Header variant="project" />
      <main id="contenido" className="mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-center px-4 py-16 lg:px-10">
        <p className="eyebrow mb-4 flex items-center gap-2.5">
          <span aria-hidden="true" className="rec-blink inline-block size-2.5 rounded-full bg-rec" />
          Corte
        </p>
        <h1 className="display knockout mb-8 text-[length:clamp(56px,16vw,200px)] leading-[.9]">
          Esta toma
          <br />
          no existe
        </h1>
        <Link
          to="/"
          className="display inline-flex min-h-14 w-fit items-center gap-3 bg-rec px-6 text-2xl tracking-[.04em] transition-colors duration-150 cut-md hover:bg-ink hover:text-paper"
        >
          <ArrowLeft size={22} />
          Volver al inicio
        </Link>
      </main>
    </Page>
  )
}
