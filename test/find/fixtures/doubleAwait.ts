export const input = `
async function foo() {
  await (await browser.$('#foo')).click()
}
`

export const find = `await (await browser.$($a)).$b()`

export const expected = [
  {
    node: `await (await browser.$('#foo')).click()`,
    captures: { a: "'#foo'", b: 'click' },
  },
]
