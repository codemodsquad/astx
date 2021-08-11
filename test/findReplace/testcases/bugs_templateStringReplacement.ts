export const input = `
deviceTagNode().child('foo').child('bar').child('baz')
`

export const find = `
deviceTagNode().child('$a').child('$b').child('$c')
`

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const replace = ({ stringCaptures: { $a, $b, $c } }): string =>
  `node(\`\${deviceTag}/${$a}/${$b}/${$c}\`)`

export const expectedReplace = `
node(\`\${deviceTag}/foo/bar/baz\`)
`
