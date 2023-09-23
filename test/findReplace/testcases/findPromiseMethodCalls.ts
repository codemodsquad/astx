export const input = `
function foo(thing) {
  thing.then(() => blah).finally(() => done)
  return thing.then(
    value => value * 2,
    error => logged(error)
  ).catch(error => blah)
}
`

export const find = `
$Or($a.then($handleValue), $a.then($handleValue, $handleError), $a.catch($handleError), $a.finally($handleFinally))
`

export const expectedFind = [
  {
    captures: {
      $a: 'thing.then(() => blah)',
      $handleFinally: '() => done',
    },
    node: 'thing.then(() => blah).finally(() => done)',
  },
  {
    captures: {
      $a: 'thing',
      $handleValue: '() => blah',
    },
    node: 'thing.then(() => blah)',
  },
  {
    captures: {
      $a: 'thing.then(\n    value => value * 2,\n    error => logged(error)\n  )',
      $handleError: 'error => blah',
    },
    node: 'thing.then(\n    value => value * 2,\n    error => logged(error)\n  ).catch(error => blah)',
  },
  {
    captures: {
      $a: 'thing',
      $handleError: 'error => logged(error)',
      $handleValue: 'value => value * 2',
    },
    node: 'thing.then(\n    value => value * 2,\n    error => logged(error)\n  )',
  },
]
