export const input = `
foo\`foo\`;
baz\`baz\`;
qux\`qux \${stuff}\`;
`
export const find = `$1\`$a\``

export const expectedFind = [
  {
    node: 'foo`foo`',
    captures: {
      $1: 'foo',
    },
    stringCaptures: {
      $a: 'foo',
    },
  },
  {
    node: 'baz`baz`',
    captures: {
      $1: 'baz',
    },
    stringCaptures: {
      $a: 'baz',
    },
  },
]

export const replace = `import $1 from '$a'`

export const expectedReplace = `
import foo from 'foo';
import baz from 'baz';
qux\`qux \${stuff}\`;
`
