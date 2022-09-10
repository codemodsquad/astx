export const input = `
import A, {B, C} from 'a'
import * as D from 'c'

x = 5
foo(bar)
`

export const find = `
import { /**/ $a } from 'a'
`

export const expectedFind = ['A', 'B', 'C', '* as D'].map((node) => ({
  node,
  captures: { $a: node },
}))
