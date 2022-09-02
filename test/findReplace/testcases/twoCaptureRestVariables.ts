export const input = `
const x = 1
`

export const find = `
const x = {
  ...foo(), // get some incidental test coverage
  ...$$a, ...$$b
}
`

export const expectedError = `can't have two or more rest matchers as siblings`
