export const input = `
<A b c="d" {...e}>{f} g</A>
h
i.j
k()
`

export const find = `
<A /**/ $a />
`

export const expectedFind = ['b', 'c="d"', '{...e}'].map((node) => ({
  node,
  captures: { $a: node },
}))
