import { once } from 'lodash'

export const registerTsNode = once(async () => {
  {
    const { register } = await import('ts-node')
    register({ transpileOnly: true })
  }
  {
    const { register } = await import('./registerTsNodeEsm')
    await register()
  }
})
