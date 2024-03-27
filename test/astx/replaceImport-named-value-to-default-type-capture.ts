import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    import { foo as blah, foo2 } from 'foo'
    import bar from 'bar'
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.replaceImport`import { foo as $foo } from 'foo'`()
      .with`import type $foo from 'renamed/foo'`()
  },
  expected: dedent`
    import { foo2 } from 'foo'
    import bar from 'bar'
    import type blah from 'renamed/foo'
  `,
})
