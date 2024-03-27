import { expect } from 'chai'
import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    import { a } from 'a'
    import { b } from 'b'
    import type { c } from 'c'
    import { type d } from 'd'

    function foo() {

    }
  `,
  astx: ({ astx }: TransformOptions): void => {
    const match = astx.addImports`
      import { a as $a } from 'a'
      import type { b as $b } from 'b'
    `()
    expect(match.$a.code).to.equal('a')
    expect(match.$b.code).to.equal('b')
  },
  expected: dedent`
    import { a } from 'a'
    import { b } from 'b'
    import type { c } from 'c'
    import { type d } from 'd'

    function foo() {

    }
  `,
})
