export const input = `
const x = {...$b}
`

export const find = '{...$_b}'

export const expectedFind = [
  {
    node: '{...$b}',
  },
]
