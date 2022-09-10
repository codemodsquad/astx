export const input = `
type A = number
A.x
type B = string
B()
`

export const find = `
type /**/$a = number
`

export const expectedFind = ['A', 'B'].map((node) => ({
  node,
  captures: { $a: node },
}))
