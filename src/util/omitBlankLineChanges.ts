import { diffLines } from 'diff'

export default function omitBlankLineChanges(
  oldStr: string,
  newStr: string
): string {
  const changes = diffLines(oldStr, newStr, { newlineIsToken: true })
  const result = []
  let lastChange
  for (const c of changes) {
    if (c.removed ? !/\S/.test(c.value) : /\S/.test(c.value) || !c.added) {
      let { value } = c
      if (c.added && lastChange && !lastChange.added)
        value = value.replace(/^\n+/, '')
      result.push(value)
    }
    lastChange = c
  }
  return result.join('')
}
