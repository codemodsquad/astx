async function importTransformFile(transformFile) {
  return await (
    await import('./importTransformFile.mjs')
  ).importTransformFile(transformFile)
}

exports.importTransformFile = importTransformFile
