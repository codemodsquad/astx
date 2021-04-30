export const input = `
const a = (
  <div>
    foo  bar

    {bar}
  </div>
)

const b = <div>  foo bar {bar} </div>
const c = <div>foo bar{bar}</div>
`

export const find = `
<div>foo bar{bar}</div>
`

export const expectedFind = [
  {
    node: `<div>
  foo  bar

  {bar}
</div>`,
  },
  {
    node: `<div>foo bar{bar}</div>`,
  },
]
