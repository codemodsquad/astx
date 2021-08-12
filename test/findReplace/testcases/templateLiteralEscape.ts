export const input = `
const x = \`$foo\`
`

export const find = `\`$_foo\``

export const expectedFind = [{ node: '`$foo`' }]

export const replace = `\`$_bar\``

export const expectedReplace = `
const x = \`$bar\`
`
