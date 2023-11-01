import { TransformOptions } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  parsers: ['babel', 'babel/tsx'],
  input: dedent`
    function foo(props) {
      class X {
        blah() {
          useStyles() 
        }
      }
    }
    function baz() {
      const bar = (props) => {
        useStyles()
      }
    }
  `,
  astx: ({ astx }: TransformOptions): void => {
    const fns = astx.find`useStyles()`().closest(
      (astx) =>
        astx.node.type === 'FunctionDeclaration' ||
        astx.node.type === 'ArrowFunctionExpression'
    )
    fns.destruct`function $x($$args) { $$body }`()
      .replace`function $x($$args, test) { $$body }`()
    fns.destruct`($$args) => $body`().replace`($$args, test) => $body`()
  },
  expected: dedent`
    function foo(props, test) {
      class X {
        blah() {
          useStyles() 
        }
      }
    }

    function baz() {
      const bar = (props, test) => {
        useStyles()
      };
    }
  `,
})
