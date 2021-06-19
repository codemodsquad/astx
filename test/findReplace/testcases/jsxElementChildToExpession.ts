export const input = `
const body = () => (
  <Mui.Button>
    <Placeholder type="expression" stop={0} />
  </Mui.Button>
)
`

export const find = `
<Placeholder type="expression" stop={$stop} />
`

export const replace = `
expression($stop)
`

export const expectedReplace = `
const body = () => (
  <Mui.Button>
    {expression(0)}
  </Mui.Button>
)
`
