export const input = `
async function foo() {
  await (await browser.$('#foo')).click()
}
`

export const find = `await (await browser.$($a)).$b()`

export const expectedFind = [
  {
    node: `await (await browser.$('#foo')).click()`,
    captures: { $a: "'#foo'", $b: 'click' },
  },
]

export const replace = `await browser.$($a).$b()`

export const expectedReplace = `
async function foo() {
  await browser.$('#foo').click()
}
`
