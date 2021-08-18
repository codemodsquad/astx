export const input = `
foo()
$bar
$$baz
`

export const find = `
$_bar
$_$baz
`

export const replace = `
$_barg
$_$bazg
`

export const expectedReplace = `
foo()
$barg
$$bazg
`
