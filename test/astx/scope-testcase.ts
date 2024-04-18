import { NodePath as AstTypesNodePath } from 'ast-types/lib/node-path'
import { Astx } from '../../src'
import { astxTestcase } from '../astxTestcase'
import dedent from 'dedent-js'

astxTestcase({
  file: __filename,
  input: dedent`
    const x = 1, y = 2;
    function foo() {
      const y = 3;
      const target = x + y;
    }
  `,
  expected: dedent`
    const x = 1, y = 2;
    function foo() {
      const y = 3;
      const target = 1 + 3;
    }
  `,
  parsers: ['babel', 'babel/tsx'],
  astx: ({ astx }) => {
    for (const { $a, $b } of astx.find`const target = $a + $b`) {
      inlineNaively($a)
      inlineNaively($b)
    }
  },
})

/** kludge to gain access to scope */
type AstxWithScope = Astx & {
  path: AstTypesNodePath
}

// inspired by jscodeshift
function getDeclarator(a: AstxWithScope) {
  const name = a.path.value.name
  const bindings = new Astx(
    a.context,
    a.path.scope?.lookup(name)?.getBindings()[name]
  )
  return bindings
    .closest((astx) => astx.node.type === 'VariableDeclarator')
    .at(0)
}

function inlineNaively(a: Astx) {
  const val = getDeclarator(a as AstxWithScope).path.get('init').value
  a.replace(val)
}
