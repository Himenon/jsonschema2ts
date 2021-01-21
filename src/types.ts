import type { JSONSchema7, JSONSchema7Type as JSONSchemaType, JSONSchema7TypeName as JSONSchemaTypeName } from "json-schema";

export type { JSONSchemaType, JSONSchemaTypeName };

export interface JSONSchema extends JSONSchema7 {
  nullable?: boolean;
}

export type JSONSchemaDefinition = JSONSchema | boolean;

export interface UnSupportSchema extends Omit<JSONSchema, "type"> {
  type: JSONSchemaTypeName[];
}

export interface OneOfSchema extends Omit<JSONSchema, "oneOf"> {
  oneOf: JSONSchema[];
}

export interface AllOfSchema extends Omit<JSONSchema, "allOf"> {
  allOf: JSONSchema[];
}

export interface AnyOfSchema extends Omit<JSONSchema, "anyOf"> {
  anyOf: JSONSchema[];
}

export interface ObjectSchema extends Omit<JSONSchema, "type"> {
  type: "object";
}

export interface ObjectSchemaWithAdditionalProperties extends ObjectSchema {
  additionalProperties: JSONSchemaDefinition;
}

export interface ArraySchema extends Omit<JSONSchema, "type"> {
  type: "array";
}

export interface PrimitiveSchema extends Omit<JSONSchema, "type"> {
  type: "string" | "number" | "integer" | "boolean" | "null";
}

export interface Reference {
  $ref: string;
  summary?: string;
  description?: string;
}
