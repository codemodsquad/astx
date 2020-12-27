import memoize from 'lodash/memoize'

const sortFlags = memoize((flags: string): string => {
  return flags.split('').sort().join('')
})
export default sortFlags
