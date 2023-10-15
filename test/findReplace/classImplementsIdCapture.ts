export const input = `
class Foo implements Bar<Baz> {

}
`

export const find = `
class $A implements $B<$C> {

}
`

export const replace = `
class $B implements $C<$A> {

}
`

export const expectedReplace = `
class Bar implements Baz<Foo> {

}
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
