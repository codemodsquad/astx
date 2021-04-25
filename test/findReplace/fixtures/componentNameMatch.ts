export const input = `
const Styles = 'div'
const foo = <Styles />
`

export const find = `
const $Styles = $value
const $foo = <$Styles />
`

export const expectedFind = [
  {
    captures: {
      $Styles: 'Styles',
      $foo: 'foo',
      $value: "'div'",
    },
    nodes: ["const Styles = 'div'", 'const foo = <Styles />'],
  },
]
