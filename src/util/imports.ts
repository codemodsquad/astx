import {
  ImportSpecifier,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
} from '../types'

export function getImportKind(
  specifier:
    | ImportSpecifier
    | ImportDefaultSpecifier
    | ImportNamespaceSpecifier,
  declKind: 'type' | 'typeof' | 'value' = 'value'
): 'type' | 'typeof' | 'value' {
  return 'importKind' in specifier ? specifier.importKind || declKind : declKind
}

export const NAMESPACE = Symbol('NAMESPACE')

export function getImported(
  specifier: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
): string | typeof NAMESPACE {
  switch (specifier.type) {
    case 'ImportDefaultSpecifier':
      return 'default'
    case 'ImportNamespaceSpecifier':
      return NAMESPACE
    case 'ImportSpecifier':
      return specifier.imported.type === 'StringLiteral'
        ? specifier.imported.value
        : specifier.imported.name
  }
}

export function stripImportKind<
  S extends ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
>(specifier: S): S {
  if ('importKind' in specifier) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { importKind, ...rest } = specifier
    return rest as S
  }
  return specifier
}

export function addImportKind<
  S extends ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
>(specifier: S, importKind: 'type' | 'typeof' | 'value'): S {
  if (specifier.type === 'ImportSpecifier') return { ...specifier, importKind }
  if (importKind !== 'value') {
    throw new Error(
      `can't add importKind: ${JSON.stringify(importKind)} to an ${
        specifier.type
      }`
    )
  }
  return specifier
}
