import dedent from 'dedent-js'
import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'

astxTestcase({
  file: __filename,
  parsers: ['babel', 'babel/tsx'],
  input: dedent`
    const foo = 1
  `,
  astx: ({ astx }: TransformOptions): void => {
    ;(astx.node as any).program.body[0].leadingComments = [
      {
        type: 'CommentLine',
        value: ' @flow',
      },
    ]
  },
  expected: dedent`
    // @flow
    const foo = 1;
  `,
})
