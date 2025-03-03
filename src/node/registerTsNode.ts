import { once } from 'lodash'

export const registerTsNode = once(async () => {
  {
    const { register } = await import('ts-node')
    register({ transpileOnly: true })
  }
  const procMatch = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(process.version)
  if (
    procMatch &&
    parseInt(procMatch[1]) >= 20 &&
    (parseInt(procMatch[1]) > 20 || parseInt(procMatch[2]) > 6)
  ) {
    const { register } = await import('./registerTsNodeEsm')
    await register()
  }
})
