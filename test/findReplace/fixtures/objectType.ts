export const input = `
type Foo = { a: number, b: string, c: [number, string], d: any }
`
export const find = `
type $1 = { $$a: any, c: [number, $$b], $d: any }
`

export const expectedFind = [
  {
    node: `type Foo = { a: number, b: string, c: [number, string], d: any }`,
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
type $1 = { c: [$$b, number], $d, foo: string, $$a }
`

export const expectedRepalce = `
type Foo = { c: [string, number], d: any, foo: string, a: number, b: string }
`
