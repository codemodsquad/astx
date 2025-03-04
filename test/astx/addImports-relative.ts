import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import Path from 'path'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  transformFile: Path.resolve(__dirname, 'foo/transform.ts'),
  input: dedent`
    import {a} from '../a'
    import {b} from 'b'
    import {c, c as h} from 'c'

    function foo() {

    }

    const bar = 2
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.addImports`
      import x, {type d} from '../../a'
      import 'b'
      import {c, c as h, c as e, f} from 'c'
      import {q} from './foo/q'
    `
  },
  expected: dedent`
    import x, {a, type d} from '../a'
    import {b} from 'b'
    import {c, c as h, c as e, f} from 'c'
    import {q} from './foo/foo/q'

    function foo() {

    }

    const bar = 2
  `,
})
