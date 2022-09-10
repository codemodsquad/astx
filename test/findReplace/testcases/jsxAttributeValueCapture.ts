export const input = `
(<A b c="d" {...e} x={y}>{f} g</A>)
h
i.j
k()
`

export const find = `
(<A a=/**/{$a} />)
`

export const expectedFind = ['"d"', '{y}'].map((node) => ({
  node,
  captures: { $a: node },
}))
