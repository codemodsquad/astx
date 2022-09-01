export const input = `
import A, {B, C, D, E} from 'foo'
`

export const find = `import A, {$Ordered, B, C, D, E} from 'foo'`

export const expectedFind = [
  {
    node: `import A, {B, C, D, E} from 'foo'`,
  },
]
