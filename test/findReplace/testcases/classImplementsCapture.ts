export const input = `
class Foo extends X implements Bar, Baz {

}
`

export const find = `
class X implements /**/ $a {

}
`

export const expectedFind = ['Bar', 'Baz'].map((node) => ({
  node,
  captures: { $a: node },
}))
