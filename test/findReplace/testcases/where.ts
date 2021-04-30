import { ASTPath } from 'jscodeshift'

export const input = `
1 + 2
const foo = bar
3 + 5
`

export const find = `$a + $b`

export const findOptions = {
  where: {
    $b: (path: ASTPath<any>): boolean =>
      typeof path.node.value === 'number' && path.node.value < 4,
  },
}

export const expectedFind = [
  {
    node: '1 + 2',
    captures: { $a: '1', $b: '2' },
  },
]

export const replace = `$b + $a`

export const replaceOptions = {
  where: {
    $b: (path: ASTPath<any>): boolean =>
      typeof path.node.value === 'number' && path.node.value < 4,
  },
}

export const expectedReplace = `
2 + 1
const foo = bar
3 + 5
`
