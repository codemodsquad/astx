import typesPlugin from 'ast-types/lib/types'
import * as defaultTypes from '@babel/types'
import { mapValues } from 'lodash'
import fork from 'ast-types/fork'
import { Fork } from 'ast-types/types'
import nodePathPlugin from 'ast-types/lib/node-path'

export default function babelAstTypes(
  t: typeof defaultTypes = defaultTypes
): ReturnType<typeof fork> {
  function babel(fork: Fork) {
    const types = fork.use(typesPlugin)
    const { builtInTypes, Type } = types
    const { def, or } = Type

    fork.use(nodePathPlugin)

    def('Node').field('type', builtInTypes.string)

    function tryConvertValidate(validate: any, node?: any): any {
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
        fields
      )) {
        d.field(
          field,
          convertValidate(validate),
          Array.isArray(_default)
            ? () => [..._default]
            : _default !== undefined
            ? () => _default
            : undefined
        )
      }
    }
  }

  return fork([babel])
}
