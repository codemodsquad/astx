export const input = `
const a = ['foo', \`foo\`]
const b = ['bar', \`bar\`]
const c = ['baz', \`qux\`]
`

export const find = `['$a', \`$a\`]`

export const expectedFind = [
  {
    node: "['foo', `foo`]",
    stringCaptures: {
      $a: 'foo',
    },
  },
  {
    node: "['bar', `bar`]",
    stringCaptures: {
      $a: 'bar',
    },
  },
]
