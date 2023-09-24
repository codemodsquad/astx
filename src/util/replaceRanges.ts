type Range = [number, number]

type ReplacerAPI = {
  insert: (index: number, content: string) => void
  delete: (range: Range) => void
  replace: (range: Range, replacement: string) => void
}

export function replaceRanges(
  code: string,
  replacer: (api: ReplacerAPI) => void
): string {
  const replacements: { range: Range; replacement: string }[] = []
  replacer({
    insert(index: number, content: string): void {
      this.replace([index, index], content)
    },
    delete(range: Range): void {
      this.replace(range, '')
    },
    replace(range: Range, replacement: string): void {
      replacements.push({ range, replacement })
    },
  })

  if (!replacements.length) return code
  replacements.sort((a, b) => a.range[0] - b.range[0])
  const overlapIndex = replacements.findIndex(
    (r, index) => index > 0 && replacements[index - 1].range[1] > r.range[0]
  )
  if (overlapIndex >= 0) {
    throw new Error(
      `replacements overlap: ${JSON.stringify(
        replacements[overlapIndex - 1]
      )} and ${JSON.stringify(replacements[overlapIndex])}`
    )
  }

  const parts = []
  let end = 0
  for (const {
    range: [from, to],
    replacement,
  } of replacements) {
    if (from > end) parts.push(code.substring(end, from))
    parts.push(replacement)
    end = to
  }
  if (end < code.length) parts.push(code.substring(end))
  return parts.join('')
}
