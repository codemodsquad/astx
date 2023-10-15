export const input = `
class Foo {
  // Test 1
  a: number;
  // Test 2
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
  // Test 1
  declare a: number;
  // Test 2
  declare b: string;
}
`
