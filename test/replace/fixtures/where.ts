import { ASTPath } from 'jscodeshift'

export const input = `
1 + 2
const foo = bar
3 + 5
`

export const find = `$a + $b`

export const replace = `$b + $a`

export const where = {
  $b: (path: ASTPath<any>): boolean =>
    typeof path.node.value === 'number' && path.node.value < 4,
}

export const expected = `
2 + 1
const foo = bar
3 + 5
`
