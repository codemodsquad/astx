export const input = `
let a, b
c()
d = x
`

export const find = `
let /**/ $a
`

export const expectedFind = ['a', 'b'].map((node) => ({
  node,
  captures: { $a: node },
}))
