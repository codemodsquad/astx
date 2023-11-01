import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  parsers: ['babel', 'babel/tsx'],
  input: dedent`
    class Foo {
      x() { }
    }
    function foo() {
      class Bar {
        y() { }
      }
    }
  `,
  astx: ({ astx }: TransformOptions): void => {
    astx
      .find(
        (astx) => astx.node.type === 'Identifier' && astx.node.name !== 'foo'
      )
      .replace((astx, parse) => parse`blah${astx.code}`)
  },
  expected: dedent`
    class blahFoo {
      blahx() { }

    }

    function foo() {
      class blahBar {
        blahy() { }

      }
    }
  `,
})
