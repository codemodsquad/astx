export const input = `
var a = 1
var b: number = 2
var [c, d] = f
`

export const find = `
var $a = $b
`

export const replace = `
const $a = $b
`

export const expectedReplace = `
const a = 1
const b: number = 2
const [c, d] = f
`
