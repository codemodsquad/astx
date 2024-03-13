import lodashFp from 'lodash/fp'
const { mapValues, map } = lodashFp
import { TransformResult } from '../Astx'
import { Backend } from '../backend/Backend'
import { Match } from '../find'
import { Location, Node, NodePath } from '../types'
import CodeFrameError, { SourceLocation } from '../util/CodeFrameError'

export type IpcPath = (string | number)[]
export type IpcNode = {
  location: Location
}

export type IpcMatch = {
  type: 'node' | 'nodes'
  path: IpcPath
  node: IpcNode
  paths: IpcPath[]
  nodes: IpcNode[]
  pathCaptures?: Record<string, IpcPath>
  captures?: Record<string, IpcNode>
  arrayPathCaptures?: Record<string, IpcPath[]>
  arrayCaptures?: Record<string, IpcNode[]>
  stringCaptures?: Record<string, string>
}

function makeIpcPath(path: NodePath): IpcPath {
  const result: (string | number)[] = []
  for (let p = path; p.parent != null; p = p.parent) {
    if (p.name != null) result.push(p.name)
  }
  return result.reverse()
}

export function makeIpcMatch(
  backend: Backend,
  {
    type,
    path,
    node,
    paths,
    nodes,
    pathCaptures,
    captures,
    arrayPathCaptures,
    arrayCaptures,
    stringCaptures,
  }: Match
): IpcMatch {
  function makeIpcNode(node: Node): IpcNode {
    return { location: backend.location(node) }
  }
  function makeIpcPath(path: NodePath): IpcPath {
    const result: (string | number)[] = []
    for (let p = path; p.parent != null; p = p.parent) {
      if (p.name != null) result.push(p.name)
    }
    return result.reverse()
  }

  const result: IpcMatch = {
    type,
    path: makeIpcPath(path),
    node: makeIpcNode(node),
    paths: paths.map(makeIpcPath),
    nodes: nodes.map(makeIpcNode),
  }
  if (pathCaptures) {
    result.pathCaptures = mapValues(makeIpcPath)(pathCaptures)
  }
  if (captures) {
    result.captures = mapValues(makeIpcNode)(captures)
  }
  if (arrayPathCaptures) {
    result.arrayPathCaptures = mapValues(map(makeIpcPath))(arrayPathCaptures)
  }
  if (arrayCaptures) {
    result.arrayCaptures = mapValues(map(makeIpcNode))(arrayCaptures)
  }
  if (stringCaptures) {
    result.stringCaptures = stringCaptures
  }
  return result
}

export type IpcCodeFrameError = {
  name: 'CodeFrameError'
  message: string
  stack?: string
  filename?: string
  source?: string
  path?: IpcPath
  loc?: SourceLocation
}

export type IpcOtherError = {
  name: 'Error'
  message: string
  stack?: string
}

export type IpcError = IpcCodeFrameError | IpcOtherError

export type IpcTransformResult = {
  file: string
  source?: string
  transformed?: string
  reports?: any[]
  error?: IpcError
  matches?: readonly IpcMatch[]
}

export function makeIpcTransformResult({
  file,
  source,
  transformed,
  reports,
  error,
  matches,
  backend,
}: TransformResult): IpcTransformResult {
  const result: IpcTransformResult = { file, source, transformed, reports }
  if (error) {
    if (error instanceof CodeFrameError) {
      const { message, stack, filename, source, path, loc } = error
      result.error = {
        name: 'CodeFrameError',
        message,
        stack,
        filename,
        source,
        path: path ? makeIpcPath(path) : undefined,
        loc,
      }
    } else {
      result.error = {
        name: 'Error',
        message: error.message,
        stack: error.stack,
      }
    }
  }
  if (matches) result.matches = matches.map((m) => makeIpcMatch(backend, m))
  return result
}

export function invertIpcError(error: IpcError): Error {
  switch (error.name) {
    case 'CodeFrameError': {
      const { message, filename, source, loc, stack } = error
      const result = new CodeFrameError(message, { filename, source, loc })
      result.stack = stack
      return result
    }
    default: {
      const { message, stack } = error
      const result = new Error(message)
      result.stack = stack
      return result
    }
  }
}
