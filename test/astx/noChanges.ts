import { astxTestcase } from '../astxTestcase'

astxTestcase({
  file: __filename,
  input: `
    
    // foo
     const   bar = 1
  `,
  astx: (): void => {
    // no-op
  },
  expected: `
    
    // foo
     const   bar = 1
  `,
})
