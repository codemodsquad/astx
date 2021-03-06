import { ASTPath } from 'jscodeshift'

export const input = `
const foo = require('foo')
const bar = require('bar')
const baz = require('baz' + 'qux')
const {glom, qlx} = require('foo')
`
export const find = `const $1 = require('$a')`
export const where = {
  $1: (path: ASTPath): boolean => path.node.type === 'Identifier',
}

export const expectedFind = [
  {
    node: "const foo = require('foo')",
    captures: {
      $1: 'foo',
    },
    stringCaptures: {
      $a: 'foo',
    },
  },
  {
    node: "const bar = require('bar')",
    captures: {
      $1: 'bar',
    },
    stringCaptures: {
      $a: 'bar',
    },
  },
]

export const replace = `import $1 from '$a'`

export const expectedReplace = `
import foo from 'foo'
import bar from 'bar'
const baz = require('baz' + 'qux')
const {glom, qlx} = require('foo')
`
