import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  format: false,
  parsers: ['babel', 'babel/tsx'],
  input: `// test 0
const a = 1;

// test 1
const b = 2;
/* test 2 */
const c = 3;
/* test 3 */

// test 43
const d = 4;

// test 5
// test 6`,
  find: `
    const $x = $y 
  `,
  replace: `
    const $x = $y * 2;
  `,
  expectedReplace: `// test 0
const a = 1 * 2;

// test 1
const b = 2 * 2;
/* test 2 */
const c = 3 * 2;
/* test 3 */

// test 43
const d = 4 * 2;

// test 5
// test 6`,
})
