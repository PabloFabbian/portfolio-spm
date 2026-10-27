import { ArrowRight } from '../../components/icons'
import { Reveal } from '../../components/Reveal'
import { links, site } from '../../data/site'

const VALUE_SIZE = 'text-[length:clamp(28px,8vw,40px)] lg:text-[length:clamp(28px,4.4vw,64px)]'

export function Contact() {
  const { contact } = site
  const rows = [
    {
      label: 'Email',
      value: contact.email,
      href: links.email,
      size: 'normal-case text-[length:clamp(20px,5.6vw,30px)] [overflow-wrap:anywhere] lg:text-[length:clamp(28px,4.4vw,64px)]',
    },
    {
      label: 'Instagram',
      value: `@${contact.instagram}`,
      href: links.instagram,
      external: true,
      size: `normal-case ${VALUE_SIZE}`,
    },
    { label: 'WhatsApp', value: contact.whatsapp.display, href: links.whatsapp, external: true, size: VALUE_SIZE },
  ]

  return (
    <section id="contacto" className="border-t-[3px] border-paper bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-4 pt-14 pb-6 lg:px-10 lg:pt-[88px] lg:pb-10">
        <p className="eyebrow mb-4 text-[13px] lg:mb-5 lg:text-sm">
          <span aria-hidden="true" className="text-rec">
            ●
          </span>{' '}
          (03) Contacto
        </p>
        <Reveal
          as="h2"
          className="display mb-9 text-[length:clamp(56px,16vw,96px)] leading-[.84] lg:mb-14 lg:text-[length:clamp(72px,16vw,236px)]"
        >
          <span className="block">¿Hacemos</span>
          <span className="block">algo juntos?</span>
        </Reveal>

        <ul className="border-t-[3px] border-paper">
          {rows.map((row) => (
            <li key={row.label}>
              <a
                href={row.href}
                target={row.external ? '_blank' : undefined}
                rel={row.external ? 'noopener noreferrer' : undefined}
                className="group flex min-h-11 flex-col gap-1.5 border-b-[3px] border-paper px-2 py-4 transition-colors duration-150 hover:bg-paper hover:text-ink lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6 lg:gap-y-3 lg:px-3 lg:py-5"
              >
                <span className="eyebrow lg:basis-[140px] lg:text-[13px]">{row.label}</span>
                <span className={`display leading-none lg:flex-[1_1_280px] ${row.size}`}>{row.value}</span>
                <ArrowRight size={32} className="hidden transition-transform duration-200 group-hover:translate-x-1.5 lg:block" />
              </a>
            </li>
          ))}
        </ul>

        <div className="eyebrow flex flex-wrap justify-between gap-x-6 gap-y-2 pt-7 tracking-[.1em] lg:pt-10 lg:text-[13px]">
          <span className="py-3">
            © {site.year} {site.name}
          </span>
          <a href="#inicio" className="py-3 underline-offset-4 hover:underline">
            Volver arriba
          </a>
        </div>
      </div>
    </section>
  )
}
