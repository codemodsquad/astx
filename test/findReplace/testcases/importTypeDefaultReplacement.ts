export const input = `
import foo from 'foo'
`

export const find = `
import $x from '$x'
`

export const replace = `
import type $x from '$x'
import $_x from 'y'
`

export const expectedReplace = `
import type foo from 'foo'
import $x from 'y'
`
