export const input = `
Dots(
  OrgPackage({
    subPackage: [
      'services',
      async ? 'async' : 'blocking',
      ...namespace,
      Names.ServiceType({ resource, async }),
    ],
  }),
)
`

export const find = `
OrgPackage({subPackage: [$$p]})
`

export const replace = `
[...OrgPackage(), $$p]
`

export const expectedReplace = (parser: string): string => `
Dots([
  ...OrgPackage(),
  'services',
  async ? 'async' : 'blocking',
  ...namespace,
  Names.ServiceType(${
    parser.startsWith('recast/babel')
      ? `{\n  resource,\n  async\n}`
      : `{ resource, async }`
  }),
])
`
import { findReplaceTestcase } from '../findReplaceTestcase'

findReplaceTestcase({
  file: __filename,
  input,
  find,
  replace,
  expectedReplace,
})
