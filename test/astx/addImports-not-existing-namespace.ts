import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    import a from 'a'

    function foo() {

    }
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.addImports`
      import * as b from 'a'
    `()
  },
  expected: dedent`
    import a from 'a'
    import * as b from 'a'

    function foo() {

    }
  `,
})
