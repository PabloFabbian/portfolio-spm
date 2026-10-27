import { Header } from '../components/Header'
import { Marquee } from '../components/Marquee'
import { Page } from '../components/Page'
import { site } from '../data/site'
import { useDocumentTitle, usePageScroll } from '../hooks/usePageScroll'
import { About } from '../sections/home/About'
import { Contact } from '../sections/home/Contact'
import { Hero } from '../sections/home/Hero'
import { Works } from '../sections/home/Works'

export default function Home() {
  usePageScroll()
  useDocumentTitle(`${site.name} · ${site.role}`)

  return (
    <Page>
      <Header variant="home" />
      <main id="contenido">
        <Hero />
        <Marquee items={site.tags} className="my-4 lg:my-6" />
        <About />
        <Works />
        <Contact />
      </main>
    </Page>
  )
}
