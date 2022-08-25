export const input = `
const a = (
  <div>
    foo  bar

    {bar}
    baz
    {qux}
  </div>
)

const b = <div>  foo bar {bar} </div>
const c = <div>foo bar{bar}</div>
`

export const find = `
<div>foo bar{$$c}</div>
`

export const expectedFind = [
  {
    arrayCaptures: {
      $$c: [
        'x = <X x=/**/{bar} />',
        'x = <X>{/**/}\n    baz\n  </X>',
        'x = <X x=/**/{qux} />',
        'x = <X>{/**/}\n</X>',
      ],
    },
    node: `<div>
    foo  bar

    {bar}
    baz
    {qux}
  </div>`,
  },
  {
    arrayCaptures: {
      $$c: ['x = <X x=/**/{bar} />'],
    },
    node: `<div>foo bar{bar}</div>`,
  },
]
