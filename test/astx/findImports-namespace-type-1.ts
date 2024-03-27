import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  parsers: ['babel/tsx', 'recast/babel/tsx'],
  input: dedent`
    import * as Blah from 'foo'
    import type * as Foo from 'foo' 
  `,
  astx: ({ astx, report }: TransformOptions): void => {
    report(astx.findImports`import type * as $f from 'foo'`().$f.code)
  },
  expectedReports: ['Foo'],
})
