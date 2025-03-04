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
  expectedFind: [
    {
      node: `import('../foo')`,
    },
  ],
})
