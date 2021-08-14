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
  $$a
  $b
  d(x: number): string {}
}
`

export const expectedFind = [
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
      $$a: ['a: number;', 'b: string;'],
    },
  },
]

export const replace = `
class Foo {
  d(x: number): string {}
  $b
  e(): number {}
  $$a
}
`

export const expectedReplace = `
class Foo {
  d(x: number): string {}
  c(): string {}
  e(): number {}
  a: number;
  b: string;
}
`
