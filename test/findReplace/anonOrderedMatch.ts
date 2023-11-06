import { findReplaceTestcase } from '../findReplaceTestcase'
import dedent from 'dedent-js'

findReplaceTestcase({
  file: __filename,
  input: dedent`
    MetadataItem.create({
      tag: 'foo',
      name: 'test',
    })
  `,
  find: dedent`
    MetadataItem.create({$$, name: $, $$}) 
  `,
  expectedFind: [
    {
      node: dedent`
        MetadataItem.create({
          tag: 'foo',
          name: 'test',
        })
      `,
    },
  ],
})
