import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'

astxTestcase({
  file: __filename,
  input: `
    const x = [1, 2, 3, 4]
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.find`[1, $$b, 4]`().$$b.remove()
  },
  expected: `
    const x = [1, 4];
  `,
  preferSimpleReplacement: true,
})
