export const parsers = [
  'babel',
  'babel/tsx',
  'recast/babel',
  'recast/babel/tsx',
]

export const input = `
module.exports = () => {
	return global.rules.find(
		(rule) => typeof rule.loader === 'string' && /babel-loader/.test(rule.loader)
	)
}
`

export const find = `
module.exports = () => {
	$$functionBody
}
`

export const replace = `
module.exports = {
	fn() {
		$$functionBody
	}
}
`

export const expectedReplace = `
module.exports = {
	fn() {
		return global.rules.find(
			(rule) => typeof rule.loader === 'string' && /babel-loader/.test(rule.loader)
		)
	}
}
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  parsers,
  input,
  find,
  replace,
  expectedReplace,
})
