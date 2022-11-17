import { memoize } from 'lodash'

const sortFlags = memoize((flags: string): string =>
  flags.split('').sort().join('')
)
export default sortFlags
