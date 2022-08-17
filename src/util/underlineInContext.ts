import countLines from './countLines'

export default function underlineInContext(
  source: string,
  range: { start: number; end: number }
): string {
  const prevR = source.lastIndexOf('\r', range.start) + 1
  const prevN = source.lastIndexOf('\n', range.start) + 1
  const nextR = source.indexOf('\r', range.end)
  const nextN = source.indexOf('\n', range.end)

  const start = Math.max(prevR, prevN)
  const end = Math.min(
    nextR < 0 ? source.length : nextR,
    nextN < 0 ? source.length : nextN
  )
  const startLine = countLines(source, start)

  const context = source.substring(start, end).split(/\r\n?|\n/gm)
  const underline = source
    .substring(start, end)
    .replace(/[^\t\r\n]/g, (match, offset) =>
      start + offset >= range.start && start + offset < range.end ? '^' : ' '
    )
    .split(/\r\n?|\n/gm)

  const endLine = startLine + context.length - 1
  const lineNumberLength = String(endLine).length

  const result = []
  for (let i = 0; i < context.length; i++) {
    result.push(
      `${String(startLine + i).padStart(lineNumberLength, ' ')} | ${context[i]}`
    )
    result.push(`${' '.repeat(lineNumberLength)}   ${underline[i].trimEnd()}`)
  }
  return result.join('\n')
}
