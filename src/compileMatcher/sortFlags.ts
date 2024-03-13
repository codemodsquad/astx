import lodash from 'lodash'
const { memoize } = lodash

const sortFlags = memoize((flags: string): string =>
  flags.split('').sort().join('')
)
export default sortFlags
