export const input = `
class Cls<A> extends Base {
}
`

export const find = `
class $A<$$B> extends $C<$Maybe<$D>> {

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
