import chalk from 'chalk'
import countLines from './countLines'
import { Match } from '../find'

const captureColors = [
  chalk.green,
  chalk.yellow,
  chalk.blue,
  chalk.cyan,
  chalk.magenta,
  chalk.red,
]

function deriveLineAndColumn(
  source: string,
  index: number
): { line: number; column: number } {
  const rx = /\r\n?|\n/gm

  let lastIndex = 0
  let line = 1

  while (lastIndex < index) {
    rx.lastIndex = lastIndex + 1
    const match = rx.exec(source)
    if (!match) break
    line++
    lastIndex = match.index
  }
  return { line, column: index - lastIndex }
}

function formatMatch(source: string, match: Match, lineCount: number): string {
  const lineNumberLength = String(lineCount).length

  if (match.type === 'nodes' && !match.nodes.length)
    return `${' '.repeat(lineNumberLength)} | (zero statements)`
  const { start: nodeStart, end: nodeEnd, loc } =
    match.type === 'node'
      ? (match.node as any)
      : {
          start: (match.nodes[0] as any).start,
          end: (match.nodes[match.nodes.length - 1] as any).end,
          loc: { start: (match.nodes[0] as any).loc.start },
        }
  const { line: startLine, column: startCol } =
    loc?.start || deriveLineAndColumn(source, nodeStart)
  const { captures, arrayCaptures } = match
  const start = nodeStart - startCol
  const eolRegex = /\r\n?|\n/gm
  eolRegex.lastIndex = nodeEnd
  const eolMatch = eolRegex.exec(source)
  const end = eolMatch ? eolMatch.index : nodeEnd

  let captureColor = 0

  const captureRanges = []
  if (captures) {
    for (const [key, node] of Object.entries(captures)) {
      const { start, end } = node as any
      captureRanges.push({
        key,
        start,
        end,
        color: captureColors[captureColor++] || chalk.gray,
      })
    }
  }
  if (arrayCaptures) {
    for (const [key, nodes] of Object.entries(arrayCaptures)) {
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (!first || !last) continue
      const { start } = first as any
      const { end } = last as any
      captureRanges.push({
        key,
        start,
        end,
        color: captureColors[captureColor++] || chalk.gray,
      })
    }
  }

  captureRanges.sort((a, b) => a.start - b.start)

  let lastIndex = nodeStart
  const parts = []
  for (const { start, end, color } of captureRanges) {
    if (start < lastIndex) continue
    parts.push(source.substring(lastIndex, start))
    parts.push(color(source.substring(start, end)))
    lastIndex = end
  }
  parts.push(source.substring(lastIndex, nodeEnd))

  const bolded =
    source.substring(start, nodeStart) +
    chalk.bold(parts.join('')) +
    source.substring(nodeEnd, end)

  const lines = bolded.split(/\r\n?|\n/gm)

  let line = startLine
  const result = lines
    .map((l) => `${String(line++).padStart(lineNumberLength, ' ')} | ${l}`)
    .join('\n')

  return captureRanges.length
    ? `${' '.repeat(lineNumberLength)} | ${captureRanges
        .map(({ key, color }) => color(key))
        .join(' ')}\n${result}`
    : result
}

export default function formatMatches(
  source: string,
  matches: Match[]
): string {
  const result = []
  const lineCount = countLines(source)
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    if (i > 0) result.push(' '.repeat(String(lineCount).length + 1) + '|')
    result.push(formatMatch(source, match, lineCount))
  }
  return result.join('\n')
}
