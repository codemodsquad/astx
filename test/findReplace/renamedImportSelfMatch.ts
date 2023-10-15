export const input = `import { Foo as Bar } from 'foo'`

export const expectMatchesSelf = true
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  expectMatchesSelf,
})
