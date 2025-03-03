async function register() {
  const { register } = await import('./registerTsNodeEsm.mjs')
  register()
}

exports.register = register
