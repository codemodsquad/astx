import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    function foo() {

    }

    const bar = 2
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.addImports`
      import c, {type d} from 'c'
      import 'f'
    `()
  },
  expected: dedent`
    import c, { type d } from 'c'
    import 'f'

    function foo() {

    }

    const bar = 2
  `,
})
