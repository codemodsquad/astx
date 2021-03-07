export const input = `
type Foo = (a: number, b: string, c: [number, string], d: any) => any
`

export const find = `
type $1 = ($_a, c: [number, $_b], $d) => any
`

export const expectedFind = [
  {
    node: `type Foo = (a: number, b: string, c: [number, string], d: any) => any`,
    captures: {
      $1: 'Foo',
      $d: 'd: any',
    },
    arrayCaptures: {
      $_a: ['a: number', 'b: string'],
      $_b: ['string'],
    },
  },
]

export const replace = `
type $1 = (c: [$_b, number], $d, x: number, $_a) => any
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
