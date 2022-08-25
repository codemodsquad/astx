export const input = `
const x = { a: c, b }
`

export const find = `
const x = { /**/ a: $a }
`

export const expectedFind = [
  {
    node: 'x = { /**/ a: c }',
    captures: { $a: 'c' },
  },
]

export const replace = `
const x = { /**/ c: $a }
`

export const expectedReplace = `
const x = { c: c, b }
`
