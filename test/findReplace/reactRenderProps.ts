export const input = `
function foo(): React.Node {
  return (
    <BreakpointMedia max={NARROW_WIDTH}>
      {(matches) => <div />}
    </BreakpointMedia>
  )
}
`
export const find = `
<BreakpointMedia max={$max}>{$$children}</BreakpointMedia>
`

export const expectedFind = [
  {
    captures: {
      $max: '{NARROW_WIDTH}',
    },
    arrayCaptures: {
      $$children: ['\n      ', '{(matches) => <div />}', '\n    '],
    },
    node: `<BreakpointMedia max={NARROW_WIDTH}>
      {(matches) => <div />}
    </BreakpointMedia>`,
  },
]

export const replace = `
<MediaQuery query={\`(max-width: \${$max}px)\`}>
  {$$children}
</MediaQuery>
`

export const expectedReplace = `
function foo(): React.Node {
  return (
    <MediaQuery query={\`(max-width: \${NARROW_WIDTH}px)\`}>{(matches) => <div />}</MediaQuery>
  )
}
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  expectedFind,
  replace,
  expectedReplace,
})
