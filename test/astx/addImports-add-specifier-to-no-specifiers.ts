import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    import 'a'
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.addImports`
      import x, {type d} from 'a'
    `()
  },
  expected: dedent`
    import x, {type d} from 'a'
  `,
})
