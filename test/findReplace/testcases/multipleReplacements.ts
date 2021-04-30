export const input = `
async function foo() {
  await (await browser.$('#foo')).click()
  await (await browser.$('#bar')).clickage()
}
`

export const find = `await (await browser.$($a)).$b()`
export const replace = `await browser.$($a).$b()`

export const expectedReplace = `
async function foo() {
  await browser.$('#foo').click()
  await browser.$('#bar').clickage()
}
`
