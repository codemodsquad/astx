export const input = `
for (var x of [1, 2, 3]) {
  for (var y of [4, 5, 6]) {
    print(x, y)
  }
}
`

export const find = `
for (var $a of $b) $body
`

export const replace = `
for (const $a of $b) $body
`

export const expectedReplace = `
for (const x of [1, 2, 3]) {
  for (const y of [4, 5, 6]) {
    print(x, y)
  }
}
`

export const skip = true
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
  skip,
})
