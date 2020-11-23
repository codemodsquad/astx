import { ASTNode, JSCodeshift } from 'jscodeshift'

export default function parseFindOrReplace(
  j: JSCodeshift,
  code: string
): ASTNode {
  const { expression, statement } = j.template
  try {
    return expression([code])
  } catch (error) {
    // ignore
  }
  if (/\bawait\b/.test(code)) {
    try {
      return expression([`async () => ${code}`]).body
    } catch (error) {
      // ignore
    }
  }
  return statement([code])
}
