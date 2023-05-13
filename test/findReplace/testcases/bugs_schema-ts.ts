export const input = `
import * as Generic from '~/lib/sdk-spec/generic-sdk-wrappers';
import { SetNonNullable } from '~/lib/_util';
import { JavaBundle } from './bundle';
import { SDKMethod } from './method';
import { SDKModel } from './model';
import { SDKResource } from './resource';

export type SDKSchema =
  | SDKObjectSchema
  | SDKUnionSchema
  | SDKStringSchema
  | SDKNullSchema
  | SDKBooleanSchema
  | SDKIntegerSchema
  | SDKNumberSchema
  | SDKEnumSchema
  | SDKUnknownSchema
  | SDKArraySchema
  | SDKIntersectionSchema
  | SDKMapSchema;

interface JavaSDKSchema {
  resource: SDKResource;
  model: SDKModel | null;
  propertyInfo: SDKPropertyInfo | null;
}

export type SDKPropertySchema = SDKSchema & SetNonNullable<SDKSchema, 'propertyInfo'>;

export class SDKObjectSchema extends Generic.SDKObjectSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore

  declare properties: SDKPropertySchema[];
}

export class SDKUnionSchema extends Generic.SDKUnionSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore

  declare variants: SDKSchema[];
}

export class SDKStringSchema extends Generic.SDKStringSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore
}

export class SDKNullSchema extends Generic.SDKNullSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore
}

export class SDKBooleanSchema extends Generic.SDKBooleanSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore
}

export class SDKIntegerSchema extends Generic.SDKIntegerSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore
}

export class SDKNumberSchema extends Generic.SDKNumberSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore
}

export class SDKUnknownSchema extends Generic.SDKUnknownSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore
}

export class SDKEnumSchema extends Generic.SDKEnumSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore
}

export class SDKArraySchema extends Generic.SDKArraySchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore

  declare items: SDKSchema;
}

export class SDKIntersectionSchema
  extends Generic.SDKIntersectionSchema<JavaBundle>
  implements JavaSDKSchema
{
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore

  declare entries: SDKSchema[];
}

export class SDKMapSchema extends Generic.SDKMapSchema<JavaBundle> implements JavaSDKSchema {
  declare propertyInfo: SDKPropertyInfo | null;

  override get resource(): SDKResource    { return super.resource } // prettier-ignore
  override get model(): SDKModel | null   { return super.model } // prettier-ignore
  override get method(): SDKMethod | null { return super.method } // prettier-ignore
  override get parent(): SDKSchema | null { return super.parent } // prettier-ignore

  declare items: 'unknown' | SDKSchema;
}

export class SDKPropertyInfo extends Generic.SDKPropertyInfo<JavaBundle> {
  declare parent: SDKObjectSchema;
  declare resource: SDKResource;
  declare model: SDKModel | null;
  declare method: SDKMethod | null;

  override get schema(): SDKPropertySchema {
    return super.schema as SDKPropertySchema;
  }
}
`

export const find = `
$P({ subPackage: [$$p] })
`

export const expectedFind = []

export const parsers = ['babel/tsx', 'recast/babel/tsx']
