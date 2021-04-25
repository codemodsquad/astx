export const input = `
function foo({classes}: {classes: Classes}) { }
`

export const find = `
function foo({$classes}: {$classes: $Type}) { }
`

export const expectedFind = [
  {
    captures: {
      $Type: 'Classes',
      $classes: 'classes',
    },
    node: `function foo({classes}: {classes: Classes}) { }`,
  },
]
