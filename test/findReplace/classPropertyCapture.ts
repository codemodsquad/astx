export const input = `
class A {
  a: number
  constructor() {}
  get foo() {}
}

interface B {
  b: number
}

type C = {
  b: number,
}
`

export const find = `
class X {
  /**/ $a
}
`

export const expectedFind = [
  'a: number',
  'constructor() {}',
  'get foo() {}',
].map((node) => ({
  node,
  captures: { $a: node },
}))
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
})
