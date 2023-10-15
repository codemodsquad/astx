export const input = `
<A b>c {d}</A>
(<>e {f}</>)
h
i.j
k()
`

export const find = `
(<A>{/**/}{$a}</A>)
`

export const expectedFind = ['c ', '{d}', 'e ', '{f}'].map((node) => ({
  node,
  captures: { $a: node },
}))
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
