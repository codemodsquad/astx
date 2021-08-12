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
