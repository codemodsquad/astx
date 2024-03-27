import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    import { foo as blah } from 'foo'
    import bar from 'bar'
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.replaceImport`import { foo as $foo } from 'foo'`()
      .with`import { renamed as $foo } from 'renamed/foo'`()
  },
  expected: dedent`
    import bar from 'bar'
    import { renamed as blah } from 'renamed/foo'
  `,
})
