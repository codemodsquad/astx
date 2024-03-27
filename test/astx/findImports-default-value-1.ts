import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  // parsers: ['babel/tsx'],
  input: dedent`
    import type Blah from 'foo'
    import Foo, {baz, type glarb} from 'foo' 
  `,
  astx: ({ astx, report }: TransformOptions): void => {
    report(astx.findImports`import $f from 'foo'`().$f.code)
  },
  expectedReports: ['Foo'],
})
