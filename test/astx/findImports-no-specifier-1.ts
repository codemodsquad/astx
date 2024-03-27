import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  // parsers: ['babel/tsx', 'recast/babel/tsx'],
  input: dedent`
    import * as Blah from 'foo'
    import 'foo'
  `,
  astx: ({ astx, report }: TransformOptions): void => {
    report(astx.findImports`import 'foo'`().code)
  },
  expectedReports: [`import 'foo';`],
})
