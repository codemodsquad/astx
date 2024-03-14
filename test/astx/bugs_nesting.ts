import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    const validator = t.ref(() => t.object({
      a: t.ref(() => Foo)
    }))
  `,
  parsers: ['babel', 'babel/tsx'],
  astx: ({ astx }: TransformOptions): void => {
    astx.find`t.ref(() => $x)`().replace`z.lazy(() => $x)`()
  },
  expected: dedent`
    const validator = z.lazy(() => t.object({
      a: z.lazy(() => Foo)
    }));
  `,
})
