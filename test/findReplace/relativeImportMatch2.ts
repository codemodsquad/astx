import { findReplaceTestcase } from '../findReplaceTestcase'
import dedent from 'dedent-js'
import path from 'path'

findReplaceTestcase({
  file: __filename,
  transformFile: path.resolve(__dirname, '..', 'transform.ts'),
  input: dedent`
    import a from '../foo' 
    import b from './foo' 
  `,
  find: dedent`
    import $x from './foo' 
  `,
  expectedFind: [
    {
      captures: { $x: 'a' },
      node: `import a from '../foo'`,
    },
  ],
})
