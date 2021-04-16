export const input = `
switch (foo) {
  case a:
    const x = 1
    console.log(b)
    if (c) break
    const y = 4
}
`

export const find = `
switch (foo) {
  case a:
    $a
    $_b
    if (c) $d
    $_c
}
`

export const expectedFind = [
  {
    node: `switch (foo) {
  case a:
    const x = 1
    console.log(b)
    if (c) break
    const y = 4
}`,
    captures: {
      $a: 'const x = 1',
      $d: 'break',
    },
    arrayCaptures: {
      $_b: ['console.log(b)'],
      $_c: ['const y = 4'],
    },
  },
]

export const replace = `
switch (foo) {
  case a:
    if (c) $d
    $_c
    $a
    $_b
}
`

export const expectedReplace = `
switch (foo) {
  case a:
    if (c) break

    const y = 4
    const x = 1
    console.log(b)
}
`
