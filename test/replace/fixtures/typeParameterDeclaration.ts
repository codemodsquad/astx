export const input = `
type Foo<W, X, Y, Z> = [W, X, Y, Z]
type Bar<A, B, C> = [A, B, C]
`

export const find = `type Foo<$a, $_b, Z> = $c`

export const replace = `type Foo<Z, $_b, $a> = $c`

export const expected = `
type Foo<Z, X, Y, W> = [W, X, Y, Z]
type Bar<A, B, C> = [A, B, C]
`
