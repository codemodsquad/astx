import { findReplaceTestcase } from '../findReplaceTestcase'
import dedent from 'dedent-js'

findReplaceTestcase({
  file: __filename,
  parsers: ['babel/tsx', 'recast/babel/tsx'],
  input: dedent`
    function useDebounce<F extends any>() { }
  `,
  find: dedent`
    type X</**/ $T extends any> = any
  `,
  replace: dedent`
    type X</**/ $T> = any
  `,
  expectedFind: [
    {
      captures: {
        $T: 'F',
      },
      node: 'F',
    },
  ],
  expectedReplace: dedent`
    function useDebounce<F>() { }
  `,
})
