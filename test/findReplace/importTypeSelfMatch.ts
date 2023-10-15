export const input = `import { type Foo } from 'foo'`

export const expectMatchesSelf = true
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  expectMatchesSelf,
})
