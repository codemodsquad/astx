export const input = `
class Foo {
  a: number;
  static b: string;
}
`

export const find = `
class X { /**/ static $a: $T }
`

export const replace = `
class X { /**/ declare static $a: $T }
`

export const expectedReplace = `
class Foo {
  a: number;
  declare static b: string;
}
`
