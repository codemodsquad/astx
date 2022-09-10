export const input = `
type X = (a: number, b: string) => number
`

export const find = `
type x = (/**/ $a) => any
`

export const expectedFind = ['a: number', 'b: string'].map((node) => ({
  node,
  captures: { $a: node },
}))
