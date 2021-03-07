export const input = `
class Foo {
  a: number;
  b: string;
  c(): string {}
  d(x: number): string {}
}
`
export const find = `
class Foo {
  $_a
  $b
  d(x: number): string {}
}
`

export const expected = [
  {
    node: `class Foo {
  a: number;
  b: string;
  c(): string {}
  d(x: number): string {}
}`,
    captures: {
      $b: 'c(): string {}',
    },
    arrayCaptures: {
      $_a: ['a: number;', 'b: string;'],
    },
  },
]
