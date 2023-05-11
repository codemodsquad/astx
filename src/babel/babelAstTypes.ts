import _typesPlugin from 'ast-types/lib/types'
const typesPlugin: typeof _typesPlugin =
  (_typesPlugin as any)['default'] || _typesPlugin

import _sharedPlugin from 'ast-types/lib/shared'
const sharedPlugin: typeof _sharedPlugin =
  (_sharedPlugin as any)['default'] || _sharedPlugin

import * as defaultTypes from '@babel/types'
import { memoize, omit, mapValues } from 'lodash'
import fork from 'ast-types/lib/fork'
import { Fork } from 'ast-types/lib/types'
import nodePathPlugin from 'ast-types/lib/node-path'

const babelAstTypes: (t?: typeof defaultTypes) => ReturnType<typeof fork> =
  memoize((t: typeof defaultTypes = defaultTypes): ReturnType<typeof fork> => {
    function babel(fork: Fork) {
      const types = fork.use(typesPlugin)
      const shared = fork.use(sharedPlugin)
      const defaults = shared.defaults
      const geq = shared.geq

      const { builtInTypes, Type } = types
      const { def, or } = Type

      fork.use(nodePathPlugin)

      // Abstract supertype of all syntactic entities that are allowed to have a
      // .loc field.
      def('Printable').field(
        'loc',
        or(def('SourceLocation'), null),
        defaults['null'],
        true
      )

      def('Node')
        .bases('Printable')
        .field('type', String)
        .field('comments', or([def('Comment')], null), defaults['null'], true)

      def('SourceLocation')
        .field('start', def('Position'))
        .field('end', def('Position'))
        .field('source', or(String, null), defaults['null'])

      def('Position').field('line', geq(1)).field('column', geq(0))

      def('Node').field('type', builtInTypes.string)

      function tryConvertValidate(validate: any, node?: any): any {
        if (!validate) return {}

        if (validate.type) {
          switch (validate.type) {
            case 'any':
              return {}
            case 'string':
              return builtInTypes.string
            case 'boolean':
              return builtInTypes.boolean
            case 'number':
              return builtInTypes.number
            case 'null':
              return builtInTypes.null
            case 'undefined':
              return builtInTypes.undefined
          }
        }
        if (validate.chainOf) {
          for (const elem of validate.chainOf) {
            const converted = tryConvertValidate(elem)
            if (converted) return converted
          }
        }
        if (validate.each) {
          return [convertValidate(validate.each)]
        }
        if (validate.oneOfNodeTypes) {
          return or(...validate.oneOfNodeTypes.map((type: string) => def(type)))
        }
        if (validate.oneOf) {
          return node?.optional
            ? or(...validate.oneOf, null)
            : or(...validate.oneOf)
        }
        if (validate.shapeOf) {
          return mapValues(validate.shapeOf, (value) =>
            convertValidate(value.validate, value)
          )
        }
        if (validate.oneOfNodeOrValueTypes) {
          return or(
            ...validate.oneOfNodeOrValueTypes.map((type: string) =>
              /^[A-Z]/.test(type) ? def(type) : convertValidate({ type })
            )
          )
        }
      }

      function convertValidate(validate: any, node?: any): any {
        const converted = tryConvertValidate(validate, node)
        if (!converted) {
          throw new Error(
            `couldn't determine field def for validate: ${JSON.stringify(
              validate
            )}`
          )
        }
        return converted
      }

      for (const [type, fields] of Object.entries(t.NODE_FIELDS)) {
        const d = def(type)
        d.field('type', type)
        const aliases: string[] | undefined = (t.ALIAS_KEYS as any)[type]
        if (aliases) {
          for (const alias of aliases) {
            def(alias)
          }
          d.bases('Node', ...aliases)
        } else {
          d.bases('Node')
        }
        for (const [field, { validate, default: _default }] of Object.entries(
          type === 'File' ? omit(fields, 'tokens') : fields
        )) {
          const fieldType = convertValidate(validate)
          d.field(
            field,
            fieldType,
            Array.isArray(_default)
              ? () => [..._default]
              : fieldType === builtInTypes.boolean && _default == null
              ? () => false
              : _default !== undefined
              ? () => _default
              : undefined
          )
        }
      }
    }

    const result = fork([babel])
    return result
  })

export default babelAstTypes
