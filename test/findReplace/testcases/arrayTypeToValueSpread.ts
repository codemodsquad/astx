export const parsers = ['babel/tsx', 'recast/babel/tsx']

export const input = `
type X = [...Y, Z]
`

export const find = `
type $A = [...$B, $$C]
`

export const replace = `
const $A = [...$B, $$C]
`

export const expectedReplace = `
const X = [...Y, Z]
`
