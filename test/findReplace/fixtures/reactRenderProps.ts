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
<BreakpointMedia max={$max}>{$_children}</BreakpointMedia>
`

export const expectedFind = [
  {
    captures: {
      $max: '{NARROW_WIDTH}',
    },
    arrayCaptures: {
      $_children: ['\n  ', '{(matches) => <div />}', '\n'],
    },
    node: `<BreakpointMedia max={NARROW_WIDTH}>
  {(matches) => <div />}
</BreakpointMedia>`,
  },
]

export const replace = `
<MediaQuery query={\`(max-width: \${$max}px)\`}>
  {$_children}
</MediaQuery>
`

export const expectedReplace = `
function foo(): React.Node {
  return (
    <MediaQuery query={\`(max-width: \${NARROW_WIDTH}px)\`}>{(matches) => <div />}</MediaQuery>
  )
}
`

export const skip = true
