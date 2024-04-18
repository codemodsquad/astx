import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import { NodePath as AstTypesNodePath } from 'ast-types/lib/node-path'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    const foo = 1;
  `,
  parsers: ['babel', 'babel/tsx'],
  astx: ({ astx, report }: TransformOptions): void => {
    const path = astx.find`const foo = 1;`.paths[0]
    report((path as AstTypesNodePath).scope !== null)
  },
  expectedReports: [true],
})
