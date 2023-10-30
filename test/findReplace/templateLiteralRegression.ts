import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input: `
    const x = \`foo\${1 + 2}\`
  `,
  find: `
    $a + $b 
  `,
  replace: `
    $b + $a
  `,
  expectedReplace: `
    const x = \`foo\${2 + 1}\`
  `,
})
