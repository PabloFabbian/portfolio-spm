// Clases de Tailwind compartidas por el editor

export const BOTONES = {
  principal:
    'display min-h-12 bg-rec px-5 text-xl tracking-[.04em] text-ink transition-colors duration-150 cut-sm hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rec disabled:hover:text-ink',
  secundario:
    'eyebrow min-h-11 border-[3px] border-ink bg-paper px-3.5 tracking-[.1em] transition-colors duration-150 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40',
  peligro:
    'eyebrow min-h-11 border-[3px] border-rec bg-paper px-3.5 tracking-[.1em] text-rec transition-colors duration-150 hover:bg-rec hover:text-ink',
  chico:
    'eyebrow inline-flex size-10 shrink-0 items-center justify-center border-[3px] border-ink bg-paper text-sm transition-colors duration-150 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-paper disabled:hover:text-ink',
}

export const CLASE_DE_ENTRADA =
  'w-full border-[3px] border-ink bg-white/70 px-3 py-2.5 text-[15px] leading-[1.45] text-ink placeholder:text-ink/40 focus:bg-white'
