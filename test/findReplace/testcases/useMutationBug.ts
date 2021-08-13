export const input = `
const [createFileAttachment]: [
  CreateFileAttachmentMutationFunction
] = useMutation(createFileAttachmentMutation)
`

export const find = `const [$a]: [$b] = useMutation($c)`
export const replace = `const [$a] = useMutation<$b, any>($c)`

export const expectedFind = [
  {
    node: `const [createFileAttachment]: [
  CreateFileAttachmentMutationFunction
] = useMutation(createFileAttachmentMutation)`,
    captures: {
      $a: 'createFileAttachment',
      $b: 'CreateFileAttachmentMutationFunction',
      $c: 'createFileAttachmentMutation',
    },
  },
]

export const expectedReplace = `
  const [createFileAttachment] = useMutation<CreateFileAttachmentMutationFunction, any>(createFileAttachmentMutation)
`
