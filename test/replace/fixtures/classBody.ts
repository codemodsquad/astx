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

export const replace = `
class Foo {
  d(x: number): string {}
  $b
  e(): number {}
  $_a
}
`

export const expected = `
class Foo {
  d(x: number): string {}
  c(): string {}
  e(): number {}
  a: number;
  b: string;
}
`
