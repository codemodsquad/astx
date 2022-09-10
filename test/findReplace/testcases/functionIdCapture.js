export const input = `
function a() {}
b = function c() {}
d()
`

export const find = `
function /**/ $a() {}
`

export const expectedFind = ['a', 'c'].map((node) => ({
  node,
  captures: { $a: node },
}))
