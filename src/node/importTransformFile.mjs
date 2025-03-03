export async function importTransformFile(transformFile) {
  if (/\.[cm]?tsx?$/i.test(transformFile)) {
    await import('./registerTsx.mjs')
  }
  const imported = await import(transformFile)
  if (!('astx' in imported) && !('find' in imported) && 'default' in imported) {
    return imported.default
  }
  return imported
}
