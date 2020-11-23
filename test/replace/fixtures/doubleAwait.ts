export const input = `
async function foo() {
  await (await browser.$('#foo')).click()
}
`

export const find = `await (await browser.$($a)).$b()`
export const replace = `await browser.$($a).$b()`

export const expected = `
async function foo() {
  await browser.$('#foo').click()
}
`
