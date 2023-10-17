import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'

astxTestcase({
  file: __filename,
  input: `
    const x = [1,  2, 3, 4]
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.find`$Or(2, 4)`().replace`5`()
  },
  expected: `
    const x = [1,  5, 3, 5]
  `,
  preferSimpleReplacement: true,
})
