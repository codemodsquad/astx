export const input = `
import A, {B, C, D, E} from 'foo'
`

export const find = `import A, {$Ordered, C, B, D, E} from 'foo'`

export const expectedFind = []
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
