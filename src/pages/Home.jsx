import { Header } from '../components/Header'
import { Marquee } from '../components/Marquee'
import { Page } from '../components/Page'
import { site } from '../data/site'
import { usePageScroll } from '../hooks/usePageScroll'
import { usePageSeo } from '../hooks/usePageSeo'
import { About } from '../sections/home/About'
import { Contact } from '../sections/home/Contact'
import { Hero } from '../sections/home/Hero'
import { Works } from '../sections/home/Works'

export default function Home() {
  usePageScroll()
  usePageSeo({
    title: `${site.name} · ${site.role}`,
    description: `Portfolio de ${site.name}, ${site.role.toLowerCase()}: ${site.tags.join(', ').toLowerCase()}.`,
    path: '/',
  })

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
