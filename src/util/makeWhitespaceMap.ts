function makeWhitespaceStartMap(chars: string[]): number[] {
  let start = 0
  const result: number[] = []
  for (let i = 0; i < chars.length; i++) {
    result[i] = start
    if (/\S/.test(chars[i])) start = i + 1
  }
  return result
}

function makeWhitespaceEndMap(chars: string[]): number[] {
  let end = chars.length
  const result: number[] = []
  for (let i = chars.length - 1; i >= 0; i--) {
    if (/\S/.test(chars[i])) end = i
    result[i] = end
  }
  return result
}

export function makeWhitespaceMap(src: string): {
  starts: number[]
  ends: number[]
} {
  const chars = src.split('')
  return {
    starts: makeWhitespaceStartMap(chars),
    ends: makeWhitespaceEndMap(chars),
  }
}
