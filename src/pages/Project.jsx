import { useParams } from 'react-router'
import { Header } from '../components/Header'
import { Marquee } from '../components/Marquee'
import { MediaCarousel } from '../components/MediaCarousel'
import { Page } from '../components/Page'
import { findProject } from '../data/projects'
import { site } from '../data/site'
import { useDocumentTitle, usePageScroll } from '../hooks/usePageScroll'
import { NextProject } from '../sections/project/NextProject'
import { ProjectAbout, ProjectCredits, ProjectFacts, ProjectTasks } from '../sections/project/ProjectDetails'
import { ProjectHero } from '../sections/project/ProjectHero'
import { ProjectMedia } from '../sections/project/ProjectMedia'
import NotFound from './NotFound'

export default function Project() {
  const { slug } = useParams()
  const found = findProject(slug)
  usePageScroll()
  useDocumentTitle(found ? `${found.project.title} · ${site.name}` : `Página no encontrada · ${site.name}`)

  if (!found) return <NotFound />

  const { project, index, next, total } = found

  return (
    <Page>
      <Header variant="project" counter={`Proyecto ${index + 1} de ${total}`} />
      <main id="contenido">
        <ProjectHero project={project} />
        <ProjectMedia project={project} />
        <ProjectFacts facts={project.facts} />
        <ProjectAbout project={project} />
        {project.marquee && (
          <Marquee
            items={project.marquee}
            separator="●"
            wordClassName="text-paper"
            separatorClassName="text-rec"
            className="mb-14 border-y-[3px] border-ink lg:mb-24"
            duration={30}
          />
        )}
        {project.tasks && <ProjectTasks tasks={project.tasks} intro={project.tasksIntro} />}
        {project.gallery.length > 0 && <MediaCarousel items={project.gallery} title={project.galleryTitle} />}
        {project.credits && <ProjectCredits credits={project.credits} />}
      </main>
      <NextProject next={next} position={((index + 1) % total) + 1} total={total} />
    </Page>
  )
}