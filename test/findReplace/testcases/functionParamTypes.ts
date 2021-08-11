export const input = `
type Foo = (a: number, b: string, c: [number, string], d: any, $e) => any
`

export const find = `
type $1 = ($$a, c: [number, $$b], $d, $_e) => any
`

export const expectedFind = [
  {
    node: `type Foo = (a: number, b: string, c: [number, string], d: any, $e) => any`,
    captures: {
      $1: 'Foo',
      $d: 'd: any',
    },
    arrayCaptures: {
      $$a: ['a: number', 'b: string'],
      $$b: ['string'],
    },
  },
]

export const replace = `
type $1 = (c: [$$b, number], $d, x: number, $$a) => any
`

export const expectedReplace = `
type Foo = (
  c: [string, number],
  d: any,
  x: number,
  a: number,
  b: string
) => any;
`
