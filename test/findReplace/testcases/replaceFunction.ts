import { ParsePattern } from '../../../src/Astx'
import { Match } from '../../../src/find'
import { Node } from '../../../src/types'

export const input = `
1 + 2
const foo = bar
3 + 5
`

export const find = `$a + $b`

export const replace = (
  { captures: { $a, $b } = {} }: Match,
  parse: ParsePattern
): Node | Node[] => parse`${$b} + ${$a}`

export const expectedReplace = `
2 + 1
const foo = bar
5 + 3
`
