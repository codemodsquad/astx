export const input = `
const x = <A>{1 + 2}</A>
`

export const find = `
const x = <A>{$a + $b}</A>
`

export const replace = `
const x = <A>{$b + $a}</A>
`

export const expectedReplace = `
const x = <A>{2 + 1}</A>
`
