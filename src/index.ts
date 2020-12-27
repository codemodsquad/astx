import find, { Match, FindOptions } from './find'
import replace, { replaceMatches, ReplaceOptions } from './replace'
import Astx, { ParseTag, GetReplacement, MatchArray } from './Astx'
import {
  API,
  Collection,
  Expression,
  FileInfo,
  JSCodeshift,
  Options,
  Statement,
} from 'jscodeshift'

export {
  Astx,
  ParseTag,
  GetReplacement,
  MatchArray,
  find,
  replace,
  replaceMatches,
  Match,
  FindOptions,
  ReplaceOptions,
}

interface Templates {
  expression(strings: TemplateStringsArray, ...quasis: any[]): Expression
  statement(strings: TemplateStringsArray, ...quasis: any[]): Statement
  statements(strings: TemplateStringsArray, ...quasis: any[]): Statement[]
}

export type TransformOptions = FileInfo & API & Templates & { astx: Astx }

export interface Transform {
  /**
   * If a string is returned and it is different from passed source, the transform is considered to be successful.
   * If a string is returned but it's the same as the source, the transform is considered to be unsuccessful.
   * If nothing is returned, the file is not supposed to be transformed (which is ok).
   */
  (file: TransformOptions, api: TransformOptions, options: Options):
    | string
    | null
    | undefined
    | void
}

export type AstxTransformOptions = TransformOptions & {
  root: Collection
  astx: Astx
}

export interface AstxTransform {
  (options: AstxTransformOptions): Collection | string | null | undefined | void
}
