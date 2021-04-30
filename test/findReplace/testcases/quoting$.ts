export const input = `
const x = $foo(2, 3)
`

export const find = `$_foo($a, $b)`

export const replace = `$_foo($b, $a)`

export const expectedReplace = `
const x = $foo(3, 2)
`
