import BabelBackend from './BabelBackend'
import { jsParser } from 'babel-parse-wild-code'

export default async function getBabelDefaultsBackend(
  file: string,
  { preserveFormat, ...options }: { [k in string]?: any } = {}
): Promise<BabelBackend> {
  const parser = options ? jsParser.bindParserOpts(options) : jsParser
  return new BabelBackend({
    parser: parser.forExtension(file),
    parserOptions: options,
    preserveFormat,
  })
}
