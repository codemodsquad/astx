import { findReplaceTestcase } from '../findReplaceTestcase'
import dedent from 'dedent-js'

findReplaceTestcase({
  file: __filename,
  parsers: ['babel', 'recast/babel'],
  input: dedent`
    function useDebounce<F: any>() { }
  `,
  find: dedent`
    type X</**/ $T: any> = any
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
