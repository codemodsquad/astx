export const input = `
class Foo {
  +$a: number
  static $b
  [$c]: string
  $d = 1
  $e
}
`

export const find = `
class Foo {
  +$_a: number
  static $_b
  [$_c]: string
  $_d = 1
  $_e
}
`

export const parsers = ['babylon']

export const expectedFind = [
  {
    node: input.trim(),
  },
]
