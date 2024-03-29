export const input = `
deviceTagNode().child('foo').child('bar').child('baz')
`

export const find = `
deviceTagNode().child('$a').child('$b').child('$c')
`

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const replace = ({
  stringCaptures: { $a, $b, $c } = {},
}: Match): string => `node(\`\${deviceTag}/${$a}/${$b}/${$c}\`)`

export const expectedReplace = `
node(\`\${deviceTag}/foo/bar/baz\`)
`
import { Match } from '../../src'
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
