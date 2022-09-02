export const input = `
const a = {...foo}
const b = {a, ...foo}
`

export const find = '{...$b}'

export const expectedFind = [
  {
    node: '{...foo}',
    captures: {
      $b: 'foo',
    },
  },
]
