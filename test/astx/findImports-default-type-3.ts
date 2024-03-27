import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  // parsers: ['babel/tsx'],
  input: dedent`
    import Blah from 'foo'
    import { default as Foob } from 'foo'
    import { type default as Foo } from 'foo' 
  `,
  astx: ({ astx, report }: TransformOptions): void => {
    report(astx.findImports`import type $f from 'foo'`().$f.code)
  },
  expectedReports: ['Foo'],
})
