export const input = `
import A, {B, C, D, E} from 'foo'
`

export const find = `import A, {E, C, D, B, F} from 'foo'`

export const expectedFind = []
