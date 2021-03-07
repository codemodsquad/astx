export const input = `
const a = {a: 1, ...x, b: 2, c, ...d, e: 5, f}
const b = {a: 1, b: 2, c, ...d, e: 5 }
const h = {a: 1, b: 2, c, e: 5, f}
`

export const find = `{ $_a, c, $b, e: 5, f }`

export const replace = `{ c, f, $b, $_a, e: 5 }`

export const expected = `
const a = {
  c,
  f,
  ...d,
  $_a,
  e: 5
}
const b = {a: 1, b: 2, c, ...d, e: 5 }
const h = {a: 1, b: 2, c, e: 5, f}
`
