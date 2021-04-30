import j, { ASTNode } from 'jscodeshift'
import { Match } from '../../../src/find'

export const input = `
1 + 2
const foo = bar
3 + 5
`

export const find = `$a + $b`

export const replace = ({ captures: { $a, $b } }: Match<any>): ASTNode =>
  j.template.expression`${$b} + ${$a}`

export const expectedReplace = `
2 + 1
const foo = bar
5 + 3
`
