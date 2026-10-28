/** Copia de la lista con un elemento movido de lugar */
export function mover(lista, desde, hasta) {
  if (hasta < 0 || hasta >= lista.length) return lista
  const copia = [...lista]
  const [item] = copia.splice(desde, 1)
  copia.splice(hasta, 0, item)
  return copia
}
