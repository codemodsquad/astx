import { NodePath } from '../../src/types'

export const input = `
const foo = require('foo')
const bar = require('bar')
const baz = require('baz' + 'qux')
const {glom, qlx} = require('foo')
`
export const find = `const $1 = require('$a')`
export const where = {
  $1: (path: NodePath): boolean => path.node.type === 'Identifier',
}

export const expectedFind = [
  {
    node: "const foo = require('foo')",
    captures: {
      $1: 'foo',
      $a: "'foo'",
    },
    stringCaptures: {
      $a: 'foo',
    },
  },
  {
    node: "const bar = require('bar')",
    captures: {
      $1: 'bar',
      $a: "'bar'",
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
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  where,
  expectedFind,
  replace,
  expectedReplace,
})
