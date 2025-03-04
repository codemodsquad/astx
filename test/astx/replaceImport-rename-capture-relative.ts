import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import Path from 'path'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  transformFile: Path.resolve(__filename, '..', 'bar/transform.ts'),
  input: dedent`
    import { foo as blah } from '../foo'
    import bar from 'bar'
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx.replaceImport`import { foo as $foo } from '../../foo'`
      .with`import { renamed as $foo } from '../renamed/foo'`
  },
  expected: dedent`
    import bar from 'bar'
    import { renamed as blah } from './renamed/foo'
  `,
})
