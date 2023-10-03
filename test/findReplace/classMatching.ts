export const input = `
class Everything<A> extends Base<A, string> implements Foo<A>, Bar {
}
`

export const find = `
class $A<$$B> extends $C<$$D> implements $$E {

}
`

export const expectedFind = [
  {
    arrayCaptures: {
      $$B: ['A'],
      $$D: ['A', 'string'],
      $$E: ['Foo<A>', 'Bar'],
    },
    captures: {
      $A: 'Everything',
      $C: 'Base',
    },
    node: 'class Everything<A> extends Base<A, string> implements Foo<A>, Bar {\n}',
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
