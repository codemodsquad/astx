export const input = `
import A, {B, C, D, E, F} from 'foo'
`

export const find = `import A, {E, C, D, B} from 'foo'`

export const expectedFind = []
