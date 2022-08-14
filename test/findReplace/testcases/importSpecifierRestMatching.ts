export const input = `
import x, {a, b, c, d, e} from 'f'
`

export const find = `import {$$$b, b, d} from 'f'`

export const expectedFind = [
  {
    node: `import x, {a, b, c, d, e} from 'f'`,
    arrayCaptures: {
      $$$b: ['x', 'a', 'c', 'e'],
    },
  },
]

export const replace = `import {b, $$$b, d} from 'f'`

export const expectedReplace = `import x, {b, a, c, e, d} from 'f'`
