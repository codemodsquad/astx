import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input: `
    const foo = 1
    /* test */
    const bar = 2
  `,
  find: `
    const $x = $y
  `,
  replace: `
    const $x = a($y)
  `,
  expectedReplace: `
    const foo = a(1)
    /* test */
    const bar = a(2)
  `,
})
