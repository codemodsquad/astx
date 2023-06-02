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
    arrayCaptures: {
      $$args: ['error => blah'],
    },
    captures: {
      $a: 'thing.then(\n    value => value * 2,\n    error => logged(error)\n  )',
    },
    node: 'thing.then(\n    value => value * 2,\n    error => logged(error)\n  ).catch(error => blah)',
  },
  {
    arrayCaptures: {
      $$args: ['value => value * 2', 'error => logged(error)'],
    },
    captures: {
      $a: 'thing',
    },
    node: 'thing.then(\n    value => value * 2,\n    error => logged(error)\n  )',
  },
]
