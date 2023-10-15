export const input = `
async function foo() {
  await browser.setValue(
    '#channel-form [name="metadataItem.tag"]',
    defaultChannel.metadataItem.tag
  )
}
`

export const find = `
  await browser.setValue($selector, $value)
`

export const replace = `
  await browser.$($selector).setValue($value)
`

export const expectedReplace = `
async function foo() {
  await browser.$('#channel-form [name="metadataItem.tag"]').setValue(defaultChannel.metadataItem.tag)
}
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
