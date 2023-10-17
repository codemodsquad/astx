import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'

astxTestcase({
  file: __filename,
  input: `
    const x = [1, 2, 3, 4]
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.find`$Or(2, 4)`().remove()
  },
  expected: `
    const x = [1, 3];
  `,
  preferSimpleReplacement: true,
})
