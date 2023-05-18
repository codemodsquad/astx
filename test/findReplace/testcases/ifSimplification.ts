export const input = `
if (operation.method === 'get') {
  if (pathIsForOneItem) {
    if (actionTargetsResource) return 'retrieve';
  }
}

if (operation.method === 'get') {
  if (pathIsForOneItem) {
    if (actionTargetsResource) return 'retrieve';
  } else if (actionTargetsResourceGroup) {
    return 'list';
  }
}
`

export const find = `
if ($a) { if ($b) { $$body } }
`

export const replace = `
if ($a && $b) { $$body }
`

export const expectedReplace = `
if (operation.method === 'get' && pathIsForOneItem) {
  if (actionTargetsResource) return 'retrieve';
}

if (operation.method === 'get') {
  if (pathIsForOneItem) {
    if (actionTargetsResource) return 'retrieve';
  } else if (actionTargetsResourceGroup) {
    return 'list';
  }
}
`
