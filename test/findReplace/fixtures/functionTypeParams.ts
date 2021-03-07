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
