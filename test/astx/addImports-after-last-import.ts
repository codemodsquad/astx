import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    import a from 'a'
    import b from 'b'

    function foo() {

    }
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.addImports`
      import c, {type d} from 'c'
      import 'f'
    `()
  },
  expected: dedent`
    import a from 'a'
    import b from 'b'

    import c, { type d } from 'c'
    import 'f'

    function foo() {

    }
  `,
})
