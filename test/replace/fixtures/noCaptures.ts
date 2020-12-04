export const input = `
1 + 2
const foo = bar
3 + 5
`

export const find = `1 + 2`

export const replace = `bar`

export const expected = `
bar
const foo = bar
3 + 5
`
