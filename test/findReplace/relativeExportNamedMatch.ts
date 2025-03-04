import { findReplaceTestcase } from '../findReplaceTestcase'
import dedent from 'dedent-js'
import path from 'path'

findReplaceTestcase({
  file: __filename,
  transformFile: path.resolve(__dirname, 'test/transform.ts'),
  input: dedent`
    export { a } from '../foo' 
    export { b } from './foo' 
  `,
  find: dedent`
    export { $$a } from '../../foo' 
  `,
  replace: dedent`
    export { $$a } from '../bar/baz' 
  `,
  expectedFind: [
    {
      arrayCaptures: { $$a: ['a'] },
      node: `export { a } from '../foo'`,
    },
  ],
  expectedReplace: dedent`
    export { a } from './bar/baz' 
    export { b } from './foo' 
  `,
})
