import memoize from 'lodash/memoize'

const sortFlags = memoize((flags: string): string =>
  flags.split('').sort().join('')
)
export default sortFlags
