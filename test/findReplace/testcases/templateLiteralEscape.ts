export const input = `
const x = \`$foo\`
`

export const find = `\`$_foo\``

export const expectedFind = [{ node: '`$foo`' }]
