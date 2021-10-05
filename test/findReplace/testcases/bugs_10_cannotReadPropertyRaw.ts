export const parsers = [
  'babylon',
  'tsx',
  'babylon-babel-generator',
  'tsx-babel-generator',
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
