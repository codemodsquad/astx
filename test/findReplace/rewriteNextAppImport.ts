export const input = `
import App from 'next/app'
`

export const find = `
import $App from 'next/app'
`

export const replace = `
import { App as $App } from 'next'
`

export const expectedReplace = `
import { App } from 'next'
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
