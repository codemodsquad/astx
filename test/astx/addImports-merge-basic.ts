import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    import {a} from 'a'
    import {b} from 'b'
    import {c, c as h} from 'c'

    function foo() {

    }

    const bar = 2
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.addImports`
      import x, {type d} from 'a'
      import 'b'
      import {c, c as h, c as e, f} from 'c'
    `()
  },
  expected: dedent`
    import x, {a, type d} from 'a'
    import {b} from 'b'
    import {c, c as h, c as e, f} from 'c'

    function foo() {

    }

    const bar = 2
  `,
})
