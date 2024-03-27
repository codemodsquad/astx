import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  // parsers: ['babel/tsx'],
  input: dedent`
    import Blah, {barg as qux} from 'foo'
    import type Foo from 'foo' 
  `,
  astx: ({ astx, report }: TransformOptions): void => {
    const found =
      astx.findImports`import {type default as $f, bar as $bar} from 'foo'`()
    if (found.matched) {
      report(found.$f.code)
      report(found.$bar.code)
    }
  },
  expectedReports: [],
})
