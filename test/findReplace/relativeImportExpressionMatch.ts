import { findReplaceTestcase } from '../findReplaceTestcase'
import dedent from 'dedent-js'
import path from 'path'

findReplaceTestcase({
  file: __filename,
  transformFile: path.resolve(__dirname, 'test/transform.ts'),
  input: dedent`
    import('../foo')
    import('./foo')
  `,
  find: dedent`
    import('../../foo')
  `,
  replace: dedent`
    import('../bar/baz')
  `,
  expectedFind: [
    {
      node: `import('../foo')`,
    },
  ],
  expectedReplace: dedent`
    import('./bar/baz')
    import('./foo')
  `,
})
