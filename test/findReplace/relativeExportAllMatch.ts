import { findReplaceTestcase } from '../findReplaceTestcase'
import dedent from 'dedent-js'
import path from 'path'

findReplaceTestcase({
  file: __filename,
  transformFile: path.resolve(__dirname, 'test/transform.ts'),
  input: dedent`
    export * from '../foo' 
    export * from './foo' 
  `,
  find: dedent`
    export * from '../../foo' 
  `,
  expectedFind: [
    {
      node: `export * from '../foo'`,
    },
  ],
})
