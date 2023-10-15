export const input = `
function foo({classes}: {classes: Classes}) { }
`

export const find = `
function foo({$classes}: {$classes: $Type}) { }
`

export const expectedFind = [
  {
    captures: {
      $Type: 'Classes',
      $classes: 'classes',
    },
    node: `function foo({classes}: {classes: Classes}) { }`,
  },
]
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
