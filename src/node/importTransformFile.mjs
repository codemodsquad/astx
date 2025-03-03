export async function importTransformFile(transformFile) {
  if (/\.[cm]?tsx?$/i.test(transformFile)) {
    await (await import('./registerTsNode.mjs')).registerTsNode()
  }
  const imported = await import(transformFile)
  if (!('astx' in imported) && !('find' in imported) && 'default' in imported) {
    return imported.default
  }
  return imported
}
