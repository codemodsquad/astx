export const input = `
import x, {a, b, c, d, e} from 'f'
`

export const find = `import {$$$b, b, d, q} from 'f'`

export const expectedFind = []
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
