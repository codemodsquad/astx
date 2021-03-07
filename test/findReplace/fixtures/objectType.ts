export const input = `
type Foo = { a: number, b: string, c: [number, string], d: any }
`
export const find = `
type $1 = { $_a: any, c: [number, $_b], $d: any }
`

export const expectedFind = [
  {
    node: `type Foo = { a: number, b: string, c: [number, string], d: any }`,
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
type $1 = { c: [$_b, number], $d, foo: string, $_a }
`

export const expectedRepalce = `
type Foo = { c: [string, number], d: any, foo: string, a: number, b: string }
`
