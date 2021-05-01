import find, { Match } from './find'
import replace, { replaceMatches, ReplaceOptions } from './replace'
import Astx, { FindOptions, ParseTag, GetReplacement } from './Astx'
import {
  runTransformOnFile,
  Transform,
  TransformResult,
} from './runTransformOnFile'
import runTransform from './runTransform'

export {
  Astx,
  ParseTag,
  GetReplacement,
  find,
  replace,
  replaceMatches,
  Match,
  FindOptions,
  ReplaceOptions,
  runTransform,
  runTransformOnFile,
  Transform,
  TransformResult,
}
