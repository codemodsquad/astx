import { CompileOptions, MatchResult, mergeCaptures, CompiledMatcher } from '.'
import { Node, NodePath, NodeType } from '../types'
import convertToJSXIdentifierName from '../convertReplacement/convertToJSXIdentifierName'
import { Backend } from '../backend/Backend'

export function unescapeIdentifier(identifier: string): string {
  return identifier.replace(/^\$_/, '$')
}

export function getPlaceholder(identifier: string): string | undefined {
  return /^\$([a-z0-9]+.*)?$/i.exec(identifier)?.[0]
}

export function getArrayPlaceholder(identifier: string): string | undefined {
  return /^\${2}([a-z0-9]+.*)?$/i.exec(identifier)?.[0]
}

export function getRestPlaceholder(identifier: string): string | undefined {
  return /^\${3}([a-z0-9]+.*)?$/i.exec(identifier)?.[0]
}

export function isCapturePlaceholder(identifier: string): boolean {
  return /[^$]/.test(identifier)
}

export function compileArrayPlaceholderMatcher(
  pattern: NodePath,
  identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compileOptions: CompileOptions,
  otherOptions?: {
    nodeType?: NodeType | NodeType[]
    condition?: (path: NodePath) => boolean
  }
): CompiledMatcher | void {
  const arrayPlaceholder = getArrayPlaceholder(identifier)
  if (arrayPlaceholder) {
    return {
      pattern,
      arrayPlaceholder,
      nodeType: otherOptions?.nodeType,
      match: (): MatchResult => {
        throw new Error(
          `array capture placeholder ${arrayPlaceholder} is in an invalid position`
        )
      },
    }
  }
}

export function compileRestPlaceholderMatcher(
  pattern: NodePath,
  identifier: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  compileOptions: CompileOptions,
  otherOptions?: {
    nodeType?: NodeType | NodeType[]
    condition?: (path: NodePath) => boolean
  }
): CompiledMatcher | void {
  const restPlaceholder = getRestPlaceholder(identifier)
  if (restPlaceholder) {
    return {
      pattern,
      restPlaceholder,
      nodeType: otherOptions?.nodeType,
      match: (): MatchResult => {
        throw new Error(
          `rest capture placeholder ${restPlaceholder} is in an invalid position`
        )
      },
    }
  }
}

export function capturesAreEquivalent(
  backend: Backend,
  a: Node,
  b: Node
): boolean {
  if (backend.t.astNodesAreEquivalent(a, b)) return true
  const aIdent = convertToJSXIdentifierName(a)
  const bIdent = convertToJSXIdentifierName(b)
  return aIdent ? aIdent === bIdent : false
}

export default function compilePlaceholderMatcher(
  pattern: NodePath,
  identifier: string,
  compileOptions: CompileOptions,
  otherOptions?: {
    nodeType?: NodeType | NodeType[]
    getCondition?: () => ((path: NodePath) => boolean) | undefined
  }
): CompiledMatcher | void {
  const { debug } = compileOptions
  const placeholder = getPlaceholder(identifier)
  if (placeholder) {
    const whereCondition =
      placeholder === '$' ? undefined : compileOptions?.where?.[placeholder]
    const condition = otherOptions?.getCondition?.() || (() => true)
    const nodeType = otherOptions?.nodeType
    return {
      pattern,
      placeholder,
      nodeType,
      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        if (path.value == null) return null
        debug('Placeholder', placeholder)
        if (!condition(path)) {
          debug('  condition returned false')
          return null
        }
        if (placeholder === '$') return matchSoFar || {}
        const existingCapture = matchSoFar?.captures?.[placeholder]
        if (existingCapture) {
          return capturesAreEquivalent(
            compileOptions.backend,
            existingCapture.node,
            path.value
          )
            ? matchSoFar
            : null
        }
        if (whereCondition && !whereCondition(path)) {
          debug('  where condition returned false')
          return null
        }
        debug('  captured as %s', placeholder)
        return mergeCaptures(matchSoFar, { captures: { [placeholder]: path } })
      },
    }
  }
  return (
    compileArrayPlaceholderMatcher(
      pattern,
      identifier,
      compileOptions,
      otherOptions
    ) ||
    compileRestPlaceholderMatcher(
      pattern,
      identifier,
      compileOptions,
      otherOptions
    )
  )
}

export function compileStringPlaceholderMatcher<N extends Node>(
  pattern: NodePath<N>,
  getString: (node: N) => string | null,
  compileOptions: CompileOptions,
  otherOptions?: {
    nodeType?: NodeType | NodeType[]
  }
): CompiledMatcher | void {
  const { debug } = compileOptions
  const string = getString(pattern.value)
  if (!string) return
  const placeholder = getPlaceholder(string)
  const nodeType = otherOptions?.nodeType
  if (placeholder) {
    return {
      pattern,
      placeholder,
      nodeType,
      match: (path: NodePath, matchSoFar: MatchResult): MatchResult => {
        if (path.value?.type !== pattern.value.type) return null
        debug('String Placeholder', placeholder)
        const string = getString((path as NodePath<N>).value)
        if (!string) return null
        const existingCapture = matchSoFar?.stringCaptures?.[placeholder]
        if (existingCapture) {
          return string === existingCapture ? matchSoFar : null
        }
        debug('  captured as %s', placeholder)
        return mergeCaptures(matchSoFar, {
          captures: { [placeholder]: path },
          stringCaptures: { [placeholder]: string },
        })
      },
    }
  }
}
