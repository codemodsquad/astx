export const input = `
a.b
c.d
f
g()
`

export const find = `
b./**/$a
`

export const expectedFind = ['b', 'd'].map((node) => ({
  node,
  captures: { $a: node },
}))
