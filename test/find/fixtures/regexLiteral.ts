export const input = `
const a = /bar/ig
const b = /bar/gi
const c = /bar/g
const d = /baz/gi
`

export const find = `/bar/ig`

export const expected = [
  {
    node: '/bar/ig',
  },
  {
    node: '/bar/gi',
  },
]
