export const input = `
class Cls {
}
`

export const find = `
class $A extends $Maybe<$C> {

}
`

export const expectedFind = [
  {
    arrayCaptures: {
      $$B: ['A'],
    },
    captures: {
      $A: 'Cls',
      $C: 'Base',
    },
    node: 'class Cls<A> extends Base {\n}',
  },
]

export const skip = true
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
  skip,
})
