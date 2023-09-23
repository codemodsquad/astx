export const input = `
class Foo {
  a: number;
  b: string;
}
`

export const find = `
class X { /**/ $a: $T }
`

export const replace = `
class X { /**/ declare $a: $T }
`

export const expectedReplace = `
class Foo {
  declare a: number;
  declare b: string;
}
`
