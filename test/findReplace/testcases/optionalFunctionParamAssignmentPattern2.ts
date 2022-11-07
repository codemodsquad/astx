export const input = `
function x(bar: string) { }
function y(bar = 2) { }
function z(bar: number = 2) { }
function w(bar = 2, baz) { }
`

export const find = `
function $f($a: $Maybe<$T> = $Maybe($b)) { }
`

export const expectedFind = [
  {
    captures: {
      $a: 'bar',
      $T: 'string',
      $f: 'x',
    },
    node: 'function x(bar: string) { }',
  },
  {
    captures: {
      $a: 'bar',
      $b: '2',
      $f: 'y',
    },
    node: 'function y(bar = 2) { }',
  },
  {
    captures: {
      $a: 'bar',
      $T: 'number',
      $b: '2',
      $f: 'z',
    },
    node: 'function z(bar: number = 2) { }',
  },
]
