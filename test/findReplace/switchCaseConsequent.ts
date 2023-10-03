export const input = `
switch (foo) {
  case a:
    const x = 1
    console.log(b)
    if (c) break
    const y = 4
}
`

export const find = `
switch (foo) {
  case a:
    $a
    $$b
    if (c) $d
    $$c
}
`

export const expectedFind = [
  {
    node: `switch (foo) {
  case a:
    const x = 1
    console.log(b)
    if (c) break
    const y = 4
}`,
    captures: {
      $a: 'const x = 1',
      $d: 'break',
    },
    arrayCaptures: {
      $$b: ['console.log(b)'],
      $$c: ['const y = 4'],
    },
  },
]

export const replace = `
switch (foo) {
  case a:
    if (c) $d
    $$c
    $a
    $$b
}
`

export const expectedReplace = `
switch (foo) {
  case a:
    if (c) break

    const y = 4
    const x = 1
    console.log(b)
}
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
  replace,
  expectedReplace,
})
