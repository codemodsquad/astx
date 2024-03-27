import { expect } from 'chai'
import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    import { a } from 'a'

    function foo() {

    }
  `,
  astx: ({ astx }: TransformOptions): void => {
    const match = astx.addImports`
      import { b as $b } from 'a'
    `()
    expect(match.$b.code).to.equal('b')
  },
  expected: dedent`
    import { a, b } from 'a'

    function foo() {

    }
  `,
})
