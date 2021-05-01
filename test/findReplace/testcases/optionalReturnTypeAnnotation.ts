export const input = `
function foo() { }
function bar(): number { }
`

export const find = `
function $fn(): $Optional<$ret> { }
`

export const expectedFind = [
  {
    captures: {
      $fn: 'foo',
    },
    node: 'function foo() { }',
  },
  {
    captures: {
      $fn: 'bar',
      $ret: 'number',
    },
    node: 'function bar(): number { }',
  },
]
