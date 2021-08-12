export const input = `
function foo() {
  $a
}
`

export const find = `
function foo() {
  $_a
}
`

export const expectedFind = [{ node: input.trim() }]
