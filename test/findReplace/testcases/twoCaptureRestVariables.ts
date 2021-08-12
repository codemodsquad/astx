export const input = `
const x = 1
`

export const find = `
const x = {
  ...foo(), // get some incidental test coverage
  ...$$a, ...$$b
}
`

export const expectedError = `two capture rest variables aren't allowed, found $$b and $$a`
