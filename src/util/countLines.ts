export default function countLines(
  source: string,
  until: number = source.length
): number {
  if (!source) return 0
  let lines = 1
  const eolRegex = /\r\n?|\n/gm
  while (eolRegex.exec(source) && eolRegex.lastIndex <= until) lines++
  return lines
}
