import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  parsers: ['babel/tsx', 'recast/babel/tsx'],
  input: dedent`
    import type * as Foo from 'foo' 
    import * as Blah from 'foo'
  `,
  astx: ({ astx, report }: TransformOptions): void => {
    report(astx.findImports`import * as $f from 'foo'`().$f.code)
  },
  expectedReports: ['Blah'],
})
